<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Developer;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * @group Master Data
 *
 * Reference data: property developers. Public read — no authentication required.
 */
class DeveloperController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $developers = Developer::paginate(15);
        return $this->paginated($developers->items(), $developers->total(), 15, $developers->currentPage());
    }

    public function show(Developer $developer): JsonResponse
    {
        return $this->success($developer);
    }
}
