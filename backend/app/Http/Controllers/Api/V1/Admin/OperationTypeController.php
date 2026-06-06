<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\OperationType;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Master Data
 *
 * Admin: full CRUD for operation types. Requires manager or super_admin role.
 */
class OperationTypeController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $types = OperationType::paginate(15);
        return $this->paginated($types->items(), $types->total(), 15, $types->currentPage());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|in:Buy,Rent,Stay,Off-plan|unique:operation_types',
        ]);

        $type = OperationType::create($validated);

        return $this->success($type, 'Operation type created successfully', 201);
    }

    public function show(OperationType $operationType): JsonResponse
    {
        return $this->success($operationType);
    }

    public function update(Request $request, OperationType $operationType): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|in:Buy,Rent,Stay,Off-plan|unique:operation_types,name,' . $operationType->id,
        ]);

        $operationType->update($validated);

        return $this->success($operationType, 'Operation type updated successfully');
    }

    public function destroy(OperationType $operationType): JsonResponse
    {
        $operationType->delete();

        return $this->success(null, 'Operation type deleted successfully');
    }
}
