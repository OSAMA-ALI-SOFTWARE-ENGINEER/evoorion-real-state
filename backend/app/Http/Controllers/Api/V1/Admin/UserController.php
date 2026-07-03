<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * @group Users & Favorites
 *
 * User account management (list, update, soft-delete, restore). All actions require super_admin role.
 */
class UserController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('super_admin'), 403);

        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users',
            'password'              => 'required|string|min:8|confirmed',
            'role'                  => 'required|in:super_admin,manager,agent',
            'is_active'             => 'boolean',
            'region_id'             => 'nullable|exists:regions,id',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json(['success' => true, 'data' => $user], 201);
    }

    public function index(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('super_admin'), 403);

        $users = User::query()
            ->when($request->role, fn ($q) => $q->where('role', $request->role))
            ->when($request->exclude_role, fn ($q) => $q->where('role', '!=', $request->exclude_role))
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->with('region:id,code,name,flag')
            ->withTrashed()
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $users->items(),
            'meta'    => [
                'total'        => $users->total(),
                'per_page'     => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('super_admin'), 403);

        return response()->json([
            'success' => true,
            'data'    => $user->load('agent.agency'),
        ]);
    }

    public function update(User $user, UpdateUserRequest $request): JsonResponse
    {
        $user->update($request->validated());

        return response()->json(['success' => true, 'data' => $user->fresh()]);
    }

    public function destroy(User $user): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('super_admin'), 403);

        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account',
            ], 422);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User deactivated']);
    }

    public function restore(int $id): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('super_admin'), 403);
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json(['success' => true, 'data' => $user]);
    }
}
