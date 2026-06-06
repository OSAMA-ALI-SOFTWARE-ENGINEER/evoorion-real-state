<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Area;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * @group Master Data
 *
 * Admin: full CRUD for geographic areas. Requires manager or super_admin role.
 */
class AreaController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $areas = Area::paginate(15);
        return $this->paginated($areas->items(), $areas->total(), 15, $areas->currentPage());
    }

    private function rules(bool $creating, ?int $ignoreId = null): array
    {
        $uniqueName = $creating
            ? 'required|string|max:255|unique:areas'
            : "sometimes|string|max:255|unique:areas,name,{$ignoreId}";

        return [
            'name'             => $uniqueName,
            'slug'             => $creating ? 'nullable|string' : 'sometimes|nullable|string',
            'description'      => 'nullable|string',
            'hero_image_url'   => 'nullable|url|max:500',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'long_term_roi'    => 'nullable|numeric|min:0|max:100',
            'short_term_roi'   => 'nullable|numeric|min:0|max:100',
            'appreciation'     => 'nullable|numeric|min:0|max:100',
            'off_plan_discount'=> 'nullable|numeric|min:0|max:100',
            'price_ranges'     => 'nullable|array',
            'price_ranges.*.type' => 'required_with:price_ranges|string',
            'price_ranges.*.min'  => 'required_with:price_ranges|integer|min:0',
            'price_ranges.*.max'  => 'required_with:price_ranges|integer|min:0',
            'meta_title'       => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules(true));

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $area = Area::create($validated);

        return $this->success($area, 'Area created successfully', 201);
    }

    public function show(Area $area): JsonResponse
    {
        return $this->success($area);
    }

    public function update(Request $request, Area $area): JsonResponse
    {
        $validated = $request->validate($this->rules(false, $area->id));

        if (isset($validated['name']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $area->update($validated);

        return $this->success($area->fresh(), 'Area updated successfully');
    }

    public function destroy(Area $area): JsonResponse
    {
        $area->delete();

        return $this->success(null, 'Area deleted successfully');
    }
}
