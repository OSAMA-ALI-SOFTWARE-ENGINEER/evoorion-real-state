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
        return $this->success(OperationType::all());
    }
}
