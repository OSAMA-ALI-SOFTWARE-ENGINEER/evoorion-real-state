<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Notifications
 *
 * In-app notifications for the authenticated user. Each user sees only their own notifications.
 */
class NotificationController extends Controller
{
    /**
     * List notifications
     *
     * Paginated list of the authenticated user's notifications. Pass `?unread=true` to filter unread only.
     *
     * @queryParam unread boolean Return only unread notifications. Example: true
     *
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {
     *       "id": "550e8400-e29b-41d4-a716-446655440000",
     *       "type": "App\\Notifications\\LeadAssigned",
     *       "data": {"lead_id": 1, "lead_name": "Ahmed Al-Rashid"},
     *       "read_at": null,
     *       "created_at": "2025-01-15T10:00:00.000000Z"
     *     }
     *   ],
     *   "meta": {
     *     "total": 5,
     *     "per_page": 20,
     *     "current_page": 1,
     *     "last_page": 1,
     *     "unread_count": 3
     *   }
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $user          = auth()->user();
        $onlyUnread    = $request->boolean('unread');

        $query = $onlyUnread
            ? $user->unreadNotifications()
            : $user->notifications();

        $notifications = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $notifications->items(),
            'meta'    => [
                'total'        => $notifications->total(),
                'per_page'     => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    /**
     * Unread count
     *
     * Returns the number of unread notifications for the authenticated user.
     *
     * @response 200 {
     *   "success": true,
     *   "data": {"count": 3}
     * }
     */
    public function unreadCount(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => ['count' => auth()->user()->unreadNotifications()->count()],
        ]);
    }

    public function markRead(string $id): JsonResponse
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markAllRead(): JsonResponse
    {
        auth()->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true, 'message' => 'All notifications marked as read']);
    }
}
