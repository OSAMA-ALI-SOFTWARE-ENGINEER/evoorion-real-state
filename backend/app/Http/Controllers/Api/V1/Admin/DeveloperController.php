<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Developer;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Master Data
 *
 * Admin: full CRUD for property developers. Requires manager or super_admin role.
 */
class DeveloperController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $developers = Developer::paginate(15);
        return $this->paginated($developers->items(), $developers->total(), 15, $developers->currentPage());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:developers',
            'logo_url' => 'nullable|url',
            'description' => 'nullable|string',
        ]);

        $developer = Developer::create($validated);

        return $this->success($developer, 'Developer created successfully', 201);
    }

    public function show(Developer $developer): JsonResponse
    {
        return $this->success($developer);
    }

    public function update(Request $request, Developer $developer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:developers,name,' . $developer->id,
            'logo_url' => 'nullable|url',
            'description' => 'nullable|string',
        ]);

        $developer->update($validated);

        return $this->success($developer, 'Developer updated successfully');
    }

    public function destroy(Developer $developer): JsonResponse
    {
        $developer->delete();

        return $this->success(null, 'Developer deleted successfully');
    }
}
