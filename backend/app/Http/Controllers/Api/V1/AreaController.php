<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Area;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * @group Master Data
 *
 * Reference data: geographic areas. Public read — no authentication required.
 */
class AreaController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success(Area::where('status', 'active')->get());
    }

    public function show(Area $area): JsonResponse
    {
        if (($area->status ?? 'active') !== 'active') {
            abort(404);
        }
        return $this->success($area);
    }
}
