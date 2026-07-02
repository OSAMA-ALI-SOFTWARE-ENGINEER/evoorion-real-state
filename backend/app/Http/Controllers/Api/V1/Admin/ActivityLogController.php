<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Dashboard & Reports
 *
 * Audit trail of field-level changes to admin-managed records (leads, properties,
 * blog posts, users, master data, settings). Requires manager or super_admin role.
 */
class ActivityLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);

        $logs = ActivityLog::with('user')
            ->when($request->model_type, fn ($q) => $q->where('model_type', $request->model_type))
            ->when($request->model_id, fn ($q) => $q->where('model_id', $request->model_id))
            ->when($request->action, fn ($q) => $q->where('action', $request->action))
            ->when($request->user_id, fn ($q) => $q->where('user_id', $request->user_id))
            ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest()
            ->paginate($perPage);

        return $this->paginated($logs->items(), $logs->total(), $logs->perPage(), $logs->currentPage());
    }
}
