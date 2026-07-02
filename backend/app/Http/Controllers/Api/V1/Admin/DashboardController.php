<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * @group Dashboard & Reports
 *
 * Aggregated platform statistics and agent performance metrics. Requires agent role or above.
 */
class DashboardController extends Controller
{
    /**
     * Dashboard stats
     *
     * Platform-wide counts: leads by status and source, active agents, and property availability.
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "leads": {
     *       "total": 142,
     *       "unassigned": 18,
     *       "this_month": 24,
     *       "last_month": 31,
     *       "by_status": {"new": 45, "contacted": 38, "qualified": 22, "closed": 28, "lost": 9},
     *       "by_source": {"website": 60, "instagram": 35, "facebook": 28, "whatsapp": 14, "referral": 5}
     *     },
     *     "agents": {"total": 8, "active": 7},
     *     "properties": {"total": 56, "available": 42, "featured": 10}
     *   }
     * }
     * @response 401 scenario="Unauthenticated" {"message": "Unauthenticated."}
     */
    public function stats(): JsonResponse
    {
        $leadsByStatus = Lead::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $leadsBySource = Lead::select('source', DB::raw('count(*) as total'))
            ->groupBy('source')
            ->pluck('total', 'source')
            ->toArray();

        $now = now();

        return response()->json([
            'success' => true,
            'data'    => [
                'leads' => [
                    'total'        => Lead::count(),
                    'unassigned'   => Lead::whereNull('assigned_to')->count(),
                    'this_month'   => Lead::whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->count(),
                    'last_month'   => Lead::whereMonth('created_at', $now->copy()->subMonth()->month)->whereYear('created_at', $now->copy()->subMonth()->year)->count(),
                    'by_status'    => $leadsByStatus,
                    'by_source'    => $leadsBySource,
                ],
                'agents' => [
                    'total'  => Agent::count(),
                    'active' => Agent::whereHas('user', fn ($q) => $q->where('is_active', true))->count(),
                ],
                'properties' => [
                    'total'     => Property::count(),
                    'available' => Property::where('status', 'available')->count(),
                    'featured'  => Property::where('is_featured', true)->count(),
                ],
            ],
        ]);
    }

    /**
     * Agent performance
     *
     * Per-agent breakdown: assigned properties, total leads, closed leads, and close rate.
     *
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Jane Agent",
     *       "email": "jane@evoorion.com",
     *       "properties": 5,
     *       "leads_total": 32,
     *       "leads_closed": 12,
     *       "close_rate": 37.5
     *     },
     *     {
     *       "id": 2,
     *       "name": "Mark Smith",
     *       "email": "mark@evoorion.com",
     *       "properties": 3,
     *       "leads_total": 18,
     *       "leads_closed": 6,
     *       "close_rate": 33.3
     *     }
     *   ]
     * }
     */
    public function agentPerformance(): JsonResponse
    {
        $agents = Agent::with('user')
            ->withCount([
                'propertyAssignments as properties_count',
            ])
            ->addSelect([
                'agents.*',
                DB::raw('(SELECT COUNT(*) FROM leads WHERE leads.assigned_to = agents.user_id) as leads_total'),
                DB::raw('(SELECT COUNT(*) FROM leads WHERE leads.assigned_to = agents.user_id AND leads.status = \'closed\') as leads_closed'),
            ])
            ->get()
            ->map(fn ($agent) => [
                'id'              => $agent->id,
                'name'            => $agent->user->name,
                'email'           => $agent->user->email,
                'properties'      => $agent->properties_count,
                'leads_total'     => (int) $agent->leads_total,
                'leads_closed'    => (int) $agent->leads_closed,
                'close_rate'      => $agent->leads_total > 0
                    ? round(($agent->leads_closed / $agent->leads_total) * 100, 1)
                    : 0,
            ]);

        return response()->json(['success' => true, 'data' => $agents]);
    }

    /**
     * Region breakdown
     *
     * Per-region counts of properties and leads.
     *
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {
     *       "region": {"id": 1, "code": "ae", "name": "UAE", "flag": "🇦🇪"},
     *       "properties_count": 42,
     *       "leads_count": 18
     *     }
     *   ]
     * }
     */
    public function regionBreakdown(): JsonResponse
    {
        $rows = \App\Models\Region::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->withCount('properties')
            ->addSelect([
                'regions.*',
                DB::raw('(SELECT COUNT(*) FROM leads INNER JOIN properties ON leads.property_id = properties.id WHERE properties.region_id = regions.id AND leads.deleted_at IS NULL AND properties.deleted_at IS NULL) as leads_count'),
            ])
            ->get()
            ->map(fn ($r) => [
                'region'           => ['id' => $r->id, 'code' => $r->code, 'name' => $r->name, 'flag' => $r->flag],
                'properties_count' => (int) $r->properties_count,
                'leads_count'      => (int) $r->leads_count,
            ]);

        return response()->json(['success' => true, 'data' => $rows]);
    }
}
