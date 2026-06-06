<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgentRequest;
use App\Http\Requests\UpdateAgentRequest;
use App\Models\Agent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * @group Agencies & Agents
 *
 * Manage individual agents. Creating an agent atomically creates a linked User record.
 * Read requires agent role; write requires manager or above.
 */
class AgentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $agents = Agent::with(['user', 'agency'])
            ->when($request->agency_id, fn ($q) => $q->where('agency_id', $request->agency_id))
            ->when($request->search, fn ($q) => $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$request->search}%")))
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $agents->items(),
            'meta'    => [
                'total'        => $agents->total(),
                'per_page'     => $agents->perPage(),
                'current_page' => $agents->currentPage(),
                'last_page'    => $agents->lastPage(),
            ],
        ]);
    }

    public function store(StoreAgentRequest $request): JsonResponse
    {
        $agent = DB::transaction(function () use ($request) {
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'agent',
                'is_active' => true,
            ]);

            return Agent::create([
                'user_id'   => $user->id,
                'agency_id' => $request->agency_id,
                'phone'     => $request->phone,
                'whatsapp'  => $request->whatsapp,
            ]);
        });

        return response()->json([
            'success' => true,
            'data'    => $agent->load('user', 'agency'),
        ], 201);
    }

    public function show(Agent $agent): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $agent->load(['user', 'agency', 'propertyAssignments.property']),
        ]);
    }

    public function update(Agent $agent, UpdateAgentRequest $request): JsonResponse
    {
        DB::transaction(function () use ($agent, $request) {
            if ($request->has('name')) {
                $agent->user->update(['name' => $request->name]);
            }

            $agent->update($request->only(['agency_id', 'phone', 'whatsapp']));
        });

        return response()->json([
            'success' => true,
            'data'    => $agent->fresh()->load('user', 'agency'),
        ]);
    }

    public function destroy(Agent $agent): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);
        $agent->delete();

        return response()->json(['success' => true, 'message' => 'Agent deactivated']);
    }

    public function restore(int $id): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);
        $agent = Agent::withTrashed()->findOrFail($id);
        $agent->restore();

        return response()->json(['success' => true, 'data' => $agent->load('user', 'agency')]);
    }
}
