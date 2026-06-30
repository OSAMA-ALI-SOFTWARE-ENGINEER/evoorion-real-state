<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Region;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegionController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $regions = Region::orderBy('sort_order')->orderBy('name')->get();
        return $this->success($regions);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'       => 'required|string|max:20|unique:regions,code|alpha_dash',
            'name'       => 'required|string|max:100',
            'flag'       => 'nullable|string|max:10',
            'is_active'  => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $region = Region::create($data);
        return $this->success($region, 'Region created', 201);
    }

    public function show(Region $region): JsonResponse
    {
        return $this->success($region);
    }

    public function update(Request $request, Region $region): JsonResponse
    {
        $data = $request->validate([
            'code'       => 'string|max:20|alpha_dash|unique:regions,code,' . $region->id,
            'name'       => 'string|max:100',
            'flag'       => 'nullable|string|max:10',
            'is_active'  => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $region->update($data);
        return $this->success($region, 'Region updated');
    }

    public function destroy(Region $region): JsonResponse
    {
        $region->delete();
        return $this->success(null, 'Region deleted');
    }
}
