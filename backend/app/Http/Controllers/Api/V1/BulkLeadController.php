<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkLeadRequest;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Leads
 *
 * Bulk operations on up to 100 leads at a time. All endpoints require manager or super_admin role.
 */
class BulkLeadController extends Controller
{
    /**
     * Bulk update status
     *
     * Update the status of multiple leads at once. Accepts up to 100 IDs.
     *
     * @response 200 {
     *   "success": true,
     *   "message": "5 leads updated to status 'contacted'",
     *   "updated": 5
     * }
     * @response 422 scenario="Validation error" {
     *   "message": "The status field is required.",
     *   "errors": {"status": ["The status field is required."]}
     * }
     * @response 403 scenario="Agent role (insufficient permissions)" {"message": "This action is unauthorized."}
     */
    public function updateStatus(BulkLeadRequest $request): JsonResponse
    {
        $request->validate(['status' => 'required|in:new,contacted,qualified,closed,lost']);

        $updated = Lead::whereIn('id', $request->ids)
            ->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => "{$updated} leads updated to status '{$request->status}'",
            'updated' => $updated,
        ]);
    }

    public function assign(BulkLeadRequest $request): JsonResponse
    {
        $request->validate(['assigned_to' => 'required|exists:users,id']);

        $updated = Lead::whereIn('id', $request->ids)
            ->update(['assigned_to' => $request->assigned_to]);

        return response()->json([
            'success' => true,
            'message' => "{$updated} leads assigned",
            'updated' => $updated,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);

        $request->validate([
            'ids'   => 'required|array|min:1|max:100',
            'ids.*' => 'required|integer|exists:leads,id',
        ]);

        $deleted = Lead::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => "{$deleted} leads deleted",
            'deleted' => $deleted,
        ]);
    }

    public function restore(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);

        $request->validate([
            'ids'   => 'required|array|min:1|max:100',
            'ids.*' => 'required|integer',
        ]);

        $restored = Lead::withTrashed()
            ->whereIn('id', $request->ids)
            ->restore();

        return response()->json([
            'success'  => true,
            'message'  => "{$restored} leads restored",
            'restored' => $restored,
        ]);
    }
}
