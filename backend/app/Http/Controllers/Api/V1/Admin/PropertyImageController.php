<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\PropertyImageRequest;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Services\CloudinaryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Properties
 *
 * Admin: upload and manage property images. Requires manager or super_admin role.
 */
class PropertyImageController
{
    use ApiResponse;

    public function __construct(protected CloudinaryService $cloudinaryService) {}

    public function store(PropertyImageRequest $request, Property $property): JsonResponse
    {
        $uploadedImage = $this->cloudinaryService->uploadImage($request->file('image'), 'properties');

        $image = $property->images()->create([
            'url' => $uploadedImage['url'],
            'public_id' => $uploadedImage['public_id'],
            'is_primary' => $request->boolean('is_primary'),
            'order' => $request->input('order', 0),
        ]);

        return $this->success($image, 'Image uploaded successfully', 201);
    }

    public function update(Request $request, Property $property, PropertyImage $image): JsonResponse
    {
        $request->validate([
            'is_primary' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        if ($request->boolean('is_primary')) {
            $property->images()->update(['is_primary' => false]);
        }

        $image->update($request->only(['is_primary', 'order']));

        return $this->success($image, 'Image updated successfully');
    }

    public function destroy(Property $property, PropertyImage $image): JsonResponse
    {
        $this->cloudinaryService->deleteMedia($image->public_id);
        $image->delete();

        return $this->success(null, 'Image deleted successfully');
    }
}
