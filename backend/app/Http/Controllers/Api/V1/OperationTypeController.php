<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\OperationType;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * @group Master Data
 *
 * Reference data: operation types (e.g. For Sale, For Rent). Public read — no authentication required.
 */
class OperationTypeController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $types = OperationType::where('is_active', true)
            ->withCount(['properties' => fn($q) => $q->where('is_active', true)->where('status', '!=', 'sold')])
            ->orderBy('id')
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'name'           => $t->name,
                'is_active'      => $t->is_active,
                'property_count' => $t->properties_count,
            ]);

        return $this->success($types);
    }
}
