<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Property;
use Illuminate\Http\JsonResponse;

/**
 * @group Properties
 *
 * Admin: assign and unassign agents to properties. Requires manager or super_admin role.
 */
class PropertyAgentController extends Controller
{
    public function index(Property $property): JsonResponse
    {
        $agents = $property->agents()->with('user')->get();

        return response()->json(['success' => true, 'data' => $agents]);
    }

    public function assign(Property $property, Agent $agent): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);
        if ($property->agents()->where('agents.id', $agent->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Agent already assigned to this property',
            ], 422);
        }

        $property->agents()->attach($agent->id, ['assigned_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Agent assigned to property',
            'data'    => $property->agents()->with('user')->get(),
        ], 201);
    }

    public function unassign(Property $property, Agent $agent): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);
        if (! $property->agents()->where('agents.id', $agent->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Agent not assigned to this property',
            ], 404);
        }

        $property->agents()->detach($agent->id);

        return response()->json(['success' => true, 'message' => 'Agent unassigned from property']);
    }
}
