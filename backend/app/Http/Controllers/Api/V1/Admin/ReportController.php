<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Lead;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @group Dashboard & Reports
 *
 * Analytics reports for leads, properties, and agent rankings. Requires agent role or above.
 */
class ReportController extends Controller
{
    /**
     * Lead funnel
     *
     * Count of leads at each pipeline stage plus overall conversion rate.
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "funnel": [
     *       {"status": "new", "count": 45},
     *       {"status": "contacted", "count": 38},
     *       {"status": "qualified", "count": 22},
     *       {"status": "closed", "count": 28},
     *       {"status": "lost", "count": 9}
     *     ],
     *     "total": 142,
     *     "conversion_rate": 19.7,
     *     "new_to_close_rate": 19.7
     *   }
     * }
     */
    public function leadFunnel(Request $request): JsonResponse
    {
        $statuses = ['new', 'contacted', 'qualified', 'closed', 'lost'];

        $counts = Lead::select('status', DB::raw('count(*) as total'))
            ->when($request->region, fn ($q) => $q->whereHas('property.region', fn ($r) => $r->where('code', $request->region)))
            ->groupBy('status')
            ->pluck('total', 'status');

        $funnel = collect($statuses)->map(fn ($s) => [
            'status' => $s,
            'count'  => (int) ($counts[$s] ?? 0),
        ]);

        $total      = $funnel->sum('count');
        $newCount   = (int) ($counts['new'] ?? 0);
        $closedCount = (int) ($counts['closed'] ?? 0);

        return response()->json([
            'success' => true,
            'data'    => [
                'funnel'            => $funnel,
                'total'             => $total,
                'conversion_rate'   => $total > 0 ? round(($closedCount / $total) * 100, 1) : 0,
                'new_to_close_rate' => $newCount > 0 ? round(($closedCount / $total) * 100, 1) : 0,
            ],
        ]);
    }

    /**
     * Leads over time
     *
     * Daily lead counts for the last N days (default 30, max 90). Every day appears — zero-filled.
     *
     * @queryParam days integer Days to look back (1–90). Default: 30. Example: 30
     *
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {"date": "2025-01-01", "total": 3},
     *     {"date": "2025-01-02", "total": 0},
     *     {"date": "2025-01-03", "total": 5}
     *   ]
     * }
     */
    public function leadsOverTime(Request $request): JsonResponse
    {
        $days  = min((int) $request->input('days', 30), 90);
        $from  = now()->subDays($days - 1)->startOfDay();

        $data = Lead::select(
            DB::raw("date(created_at) as date"),
            DB::raw('count(*) as total')
        )
            ->when($request->region, fn ($q) => $q->whereHas('property.region', fn ($r) => $r->where('code', $request->region)))
            ->where('created_at', '>=', $from)
            ->groupBy(DB::raw('date(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in zero-count days
        $series = collect();
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $series->push([
                'date'  => $date,
                'total' => (int) ($data[$date]->total ?? 0),
            ]);
        }

        return response()->json(['success' => true, 'data' => $series]);
    }

    public function propertyPerformance(Request $request): JsonResponse
    {
        $properties = Property::select('properties.*')
            ->addSelect(DB::raw('(SELECT COUNT(*) FROM leads WHERE leads.property_id = properties.id) as leads_count'))
            ->when($request->region, fn ($q) => $q->whereHas('region', fn ($r) => $r->where('code', $request->region)))
            ->with('area')
            ->orderByDesc('views_count')
            ->limit(20)
            ->get()
            ->map(fn ($p) => [
                'id'          => $p->id,
                'title'       => $p->title,
                'slug'        => $p->slug,
                'area'        => $p->area?->name,
                'price'       => $p->price,
                'views'       => $p->views_count,
                'leads'       => (int) $p->leads_count,
                'status'      => $p->status,
                'is_featured' => $p->is_featured,
            ]);

        return response()->json(['success' => true, 'data' => $properties]);
    }

    /**
     * Agent leaderboard
     *
     * All agents ranked by leads closed descending, with close rate percentage.
     *
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {"id": 1, "name": "Jane Agent", "leads_total": 32, "leads_closed": 12, "leads_new": 8, "close_rate": 37.5},
     *     {"id": 2, "name": "Mark Smith", "leads_total": 18, "leads_closed": 6, "leads_new": 5, "close_rate": 33.3}
     *   ]
     * }
     */
    public function agentLeaderboard(Request $request): JsonResponse
    {
        $region = $request->input('region');

        // Build the region EXISTS clause using a parameterized subquery to avoid SQL injection.
        $regionJoin = $region
            ? ' AND EXISTS (SELECT 1 FROM properties p JOIN regions r ON p.region_id = r.id WHERE p.id = leads.property_id AND r.code = ?)'
            : '';

        $agents = Agent::with('user')
            ->select('agents.*')
            ->selectRaw('(SELECT COUNT(*) FROM leads WHERE leads.assigned_to = agents.user_id' . $regionJoin . ') as leads_total', $region ? [$region] : [])
            ->selectRaw('(SELECT COUNT(*) FROM leads WHERE leads.assigned_to = agents.user_id AND leads.status = \'closed\'' . $regionJoin . ') as leads_closed', $region ? [$region] : [])
            ->selectRaw('(SELECT COUNT(*) FROM leads WHERE leads.assigned_to = agents.user_id AND leads.status = \'new\'' . $regionJoin . ') as leads_new', $region ? [$region] : [])
            ->get()
            ->map(fn ($a) => [
                'id'           => $a->id,
                'name'         => $a->user->name,
                'leads_total'  => (int) $a->leads_total,
                'leads_closed' => (int) $a->leads_closed,
                'leads_new'    => (int) $a->leads_new,
                'close_rate'   => $a->leads_total > 0
                    ? round(($a->leads_closed / $a->leads_total) * 100, 1)
                    : 0,
            ])
            ->sortByDesc('leads_closed')
            ->values();

        return response()->json(['success' => true, 'data' => $agents]);
    }

    public function leadsBySource(Request $request): JsonResponse
    {
        $data = Lead::select('source', DB::raw('count(*) as total'))
            ->when($request->region, fn ($q) => $q->whereHas('property.region', fn ($r) => $r->where('code', $request->region)))
            ->groupBy('source')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['source' => $row->source, 'total' => (int) $row->total]);

        return response()->json(['success' => true, 'data' => $data]);
    }
}
