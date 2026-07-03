<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Models\Lead;
use App\Models\LeadNote;
use App\Services\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Leads
 *
 * Submit leads (public) and manage them (admin). Agents see only their assigned leads
 * and unassigned leads — not other agents' leads.
 */
class LeadController extends Controller
{
    public function __construct(private LeadService $leadService) {}

    /**
     * Submit lead
     *
     * Public endpoint for visitors to express interest. Rate-limited to 10 requests per minute per IP.
     *
     * @unauthenticated
     *
     * @response 201 {
     *   "success": true,
     *   "data": {
     *     "id": 1,
     *     "name": "Ahmed Al-Rashid",
     *     "email": "ahmed@example.com",
     *     "phone": "+971501234567",
     *     "whatsapp": "+971501234567",
     *     "source": "website",
     *     "status": "new",
     *     "property_id": null,
     *     "budget_min": "500000.00",
     *     "budget_max": "1000000.00",
     *     "message": "Looking for a 2-bedroom apartment near the metro.",
     *     "assigned_to": null,
     *     "created_at": "2025-01-15T10:00:00.000000Z",
     *     "updated_at": "2025-01-15T10:00:00.000000Z"
     *   },
     *   "message": "Lead submitted successfully"
     * }
     * @response 422 scenario="Validation error" {
     *   "message": "The source field is required.",
     *   "errors": {"source": ["The source field is required."]}
     * }
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        // Honeypot: real users never see this field; bots fill it. Pretend success.
        if ($request->filled('company_website')) {
            return response()->json(['success' => true, 'data' => null, 'message' => 'Lead submitted successfully'], 201);
        }

        $lead = $this->leadService->createLead(collect($request->validated())->except('company_website')->all());

        return response()->json([
            'success' => true,
            'data' => $lead,
            'message' => 'Lead submitted successfully',
        ], 201);
    }

    /**
     * List leads
     *
     * Paginated list of leads. Managers see all leads; agents see only their assigned and unassigned leads.
     *
     * @queryParam status string Filter by status. Allowed: new, contacted, qualified, closed, lost. Example: new
     * @queryParam search string Search by name, email, or phone. Example: Ahmed
     * @queryParam date_from string Filter from date (YYYY-MM-DD). Example: 2025-01-01
     * @queryParam date_to string Filter to date (YYYY-MM-DD). Example: 2025-01-31
     *
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Ahmed Al-Rashid",
     *       "email": "ahmed@example.com",
     *       "phone": "+971501234567",
     *       "status": "new",
     *       "source": "website",
     *       "assigned_to": null,
     *       "created_at": "2025-01-15T10:00:00.000000Z"
     *     }
     *   ],
     *   "meta": {
     *     "total": 35,
     *     "per_page": 15,
     *     "current_page": 1,
     *     "last_page": 3
     *   }
     * }
     * @response 401 scenario="Unauthenticated" {"message": "Unauthenticated."}
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        $perPage = max(1, min((int) ($request->per_page ?? 15), 100));

        $leads = Lead::query()
            ->with([
                'assignedUser:id,name,email',
                'property:id,region_id,slug,title,type,status,price,currency,bedrooms,bathrooms,location,area_sqft',
                'property.region:id,code,name,flag',
            ])
            ->when(! $user->hasRole('manager'), fn ($q) => $q->where(function ($q) use ($user) {
                $q->whereNull('assigned_to')->orWhere('assigned_to', $user->id);
            }))
            ->when($request->status, fn ($q) => $q->byStatus($request->status))
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->date_from && $request->date_to, fn ($q) => $q->byDateRange($request->date_from, $request->date_to))
            ->when($request->region, fn ($q) => $q->whereHas('property.region', fn ($r) => $r->where('code', $request->region)))
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
            'meta' => [
                'total' => $leads->total(),
                'per_page' => $leads->perPage(),
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
            ],
        ]);
    }

    /**
     * Get lead
     *
     * Returns a single lead with its notes, assigned user, and linked property.
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": 1,
     *     "name": "Ahmed Al-Rashid",
     *     "email": "ahmed@example.com",
     *     "phone": "+971501234567",
     *     "whatsapp": "+971501234567",
     *     "status": "contacted",
     *     "source": "website",
     *     "budget_min": "500000.00",
     *     "budget_max": "1000000.00",
     *     "message": "Looking for a 2-bedroom apartment.",
     *     "property": {"id": 1, "title": "Luxury Villa in Palm Jumeirah"},
     *     "assigned_user": {"id": 2, "name": "Jane Agent", "email": "jane@evoorion.com"},
     *     "notes": [
     *       {"id": 1, "note": "Called client, scheduled viewing for 20 Jan.", "created_at": "2025-01-16T09:00:00.000000Z"}
     *     ],
     *     "created_at": "2025-01-15T10:00:00.000000Z",
     *     "updated_at": "2025-01-16T09:00:00.000000Z"
     *   }
     * }
     * @response 403 scenario="Agent accessing another agent's lead" {"message": "This action is unauthorized."}
     * @response 404 scenario="Not found" {"message": "No query results for model [App\\Models\\Lead]."}
     */
    public function show(Lead $lead): JsonResponse
    {
        $this->authorize('view', $lead);

        return response()->json([
            'success' => true,
            'data' => $lead->load('notes', 'assignedUser', 'property.area', 'property.images'),
        ]);
    }

    public function update(Lead $lead, UpdateLeadRequest $request): JsonResponse
    {
        $this->authorize('update', $lead);
        $validated = $request->validated();

        if (isset($validated['status'])) {
            $this->leadService->changeStatus($lead->id, $validated['status']);
        }

        if (array_key_exists('assigned_to', $validated)) {
            $lead->update(['assigned_to' => $validated['assigned_to']]);
        }

        if (isset($validated['note'])) {
            $this->leadService->addNote($lead->id, $validated['note']);
        }

        $lead = $lead->fresh()->load('notes', 'assignedUser', 'property.area', 'property.images');

        return response()->json(['success' => true, 'data' => $lead]);
    }

    public function destroy(Lead $lead): JsonResponse
    {
        $this->authorize('delete', $lead);
        $lead->delete();

        return response()->json(['success' => true, 'message' => 'Lead deleted']);
    }

    public function restore(int $id): JsonResponse
    {
        $lead = Lead::withTrashed()->findOrFail($id);
        $this->authorize('restore', $lead);
        $lead->restore();

        return response()->json(['success' => true, 'data' => $lead]);
    }

    public function addNote(Lead $lead, Request $request): JsonResponse
    {
        $this->authorize('addNote', $lead);
        $request->validate(['note' => 'required|string|max:2000']);
        $note = $this->leadService->addNote($lead->id, $request->note);

        return response()->json(['success' => true, 'data' => $note->load('user')], 201);
    }

    public function getNotes(Lead $lead): JsonResponse
    {
        $this->authorize('view', $lead);
        $notes = $lead->notes()->with('user')->latest()->get();

        return response()->json(['success' => true, 'data' => $notes, 'meta' => []]);
    }

    public function deleteNote(Lead $lead, LeadNote $note): JsonResponse
    {
        $this->authorize('deleteNote', $lead);
        if ($note->lead_id !== $lead->id) {
            return response()->json(['success' => false, 'message' => 'Note not found'], 404);
        }
        $note->delete();

        return response()->json(['success' => true]);
    }

    public function exportCSV(Request $request)
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);

        return $this->leadService->exportCSV($request->all());
    }
}
