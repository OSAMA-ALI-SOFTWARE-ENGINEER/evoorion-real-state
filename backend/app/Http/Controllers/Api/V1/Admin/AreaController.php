<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Area;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AreaController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $areas = Area::with('region:id,code,name,flag')->paginate(50);
        return $this->paginated($areas->items(), $areas->total(), 50, $areas->currentPage());
    }

    private function rules(bool $creating, ?int $ignoreId = null): array
    {
        return [
            'name'             => $creating
                ? 'required|string|max:255|unique:areas'
                : "sometimes|string|max:255|unique:areas,name,{$ignoreId}",
            'status'           => 'sometimes|in:active,inactive',
            'description'      => 'nullable|string',
            'hero_image_url'   => 'nullable|url|max:500',
            'gallery'          => 'nullable|array',
            'gallery.*.url'    => 'required_with:gallery|string|max:500',
            'gallery.*.type'   => 'required_with:gallery|in:image,video,file',
            'gallery.*.caption'=> 'nullable|string|max:255',
            'gallery.*.order'  => 'nullable|integer|min:0',
            'gallery.*.is_primary' => 'nullable|boolean',
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
        $validated['slug'] = Str::slug($validated['name']);

        $area = Area::create($validated);
        return $this->success($area, 'Area created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->success(Area::findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $area = Area::findOrFail($id);
        $validated = $request->validate($this->rules(false, $area->id));

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $area->update($validated);
        return $this->success($area->fresh(), 'Area updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        Area::findOrFail($id)->delete();
        return $this->success(null, 'Area deleted successfully');
    }
}
