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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:areas',
            'description' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $area = Area::create($validated);

        return $this->success($area, 'Area created successfully', 201);
    }

    public function show(Area $area): JsonResponse
    {
        return $this->success($area);
    }

    public function update(Request $request, Area $area): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:areas,name,' . $area->id,
            'description' => 'nullable|string',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $area->update($validated);

        return $this->success($area, 'Area updated successfully');
    }

    public function destroy(Area $area): JsonResponse
    {
        $area->delete();

        return $this->success(null, 'Area deleted successfully');
    }
}
