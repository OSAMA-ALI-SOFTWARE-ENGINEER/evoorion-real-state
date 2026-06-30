<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Region;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class RegionController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $regions = Region::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'flag']);

        return $this->success($regions);
    }
}
