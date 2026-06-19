<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Area;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Master Data
 *
 * Reference data: geographic areas. Public read — no authentication required.
 */
class AreaController
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $opId = $request->query('operation_type_id');

        $areas = Area::where('status', 'active')
            ->when($opId, fn($q) => $q->whereHas('properties', fn($p) => $p
                ->where('is_active', true)
                ->where('status', '!=', 'sold')
                ->where('operation_type_id', $opId)
            ))
            ->withCount(['properties' => fn($q) => $q
                ->where('is_active', true)
                ->where('status', '!=', 'sold')
                ->when($opId, fn($q) => $q->where('operation_type_id', $opId))
            ])
            ->orderByDesc('properties_count')
            ->get(['id', 'name', 'slug']);

        return $this->success($areas);
    }

    public function show(Area $area): JsonResponse
    {
        if (($area->status ?? 'active') !== 'active') {
            abort(404);
        }
        return $this->success($area);
    }
}
