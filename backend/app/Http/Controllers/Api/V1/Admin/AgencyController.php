<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgencyRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Models\Agency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Agencies & Agents
 *
 * Manage real estate agencies. Read (list/show) requires agent role; write requires manager or above.
 */
class AgencyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $agencies = Agency::withCount('agents')
            ->with('region:id,code,name,flag')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $agencies->items(),
            'meta'    => [
                'total'        => $agencies->total(),
                'per_page'     => $agencies->perPage(),
                'current_page' => $agencies->currentPage(),
                'last_page'    => $agencies->lastPage(),
            ],
        ]);
    }

    public function store(StoreAgencyRequest $request): JsonResponse
    {
        $agency = Agency::create($request->validated());

        return response()->json(['success' => true, 'data' => $agency], 201);
    }

    public function show(Agency $agency): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $agency->loadCount('agents')->load('agents.user'),
        ]);
    }

    public function update(Agency $agency, UpdateAgencyRequest $request): JsonResponse
    {
        $agency->update($request->validated());

        return response()->json(['success' => true, 'data' => $agency->fresh()]);
    }

    public function destroy(Agency $agency): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);
        if ($agency->agents()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete agency with active agents',
            ], 422);
        }

        $agency->delete();

        return response()->json(['success' => true, 'message' => 'Agency deleted']);
    }
}
