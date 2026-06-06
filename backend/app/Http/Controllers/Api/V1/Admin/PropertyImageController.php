<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\PropertyImageRequest;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Services\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyImageController
{
    use ApiResponse;

    public function __construct(protected MediaService $media) {}

    public function store(PropertyImageRequest $request, Property $property): JsonResponse
    {
        $uploaded = $this->media->uploadImage($request->file('image'), 'properties');

        $image = $property->images()->create([
            'url'        => $uploaded['url'],
            'public_id'  => $uploaded['public_id'],
            'is_primary' => $request->boolean('is_primary'),
            'order'      => $request->input('order', 0),
        ]);

        return $this->success($image, 'Image uploaded successfully', 201);
    }

    public function update(Request $request, Property $property, PropertyImage $image): JsonResponse
    {
        $request->validate([
            'is_primary' => 'nullable|boolean',
            'order'      => 'nullable|integer|min:0',
        ]);

        if ($request->boolean('is_primary')) {
            $property->images()->update(['is_primary' => false]);
        }

        $image->update($request->only(['is_primary', 'order']));

        return $this->success($image, 'Image updated successfully');
    }

    public function destroy(Property $_property, PropertyImage $image): JsonResponse
    {
        $this->media->deleteMedia($image->public_id);
        $image->delete();

        return $this->success(null, 'Image deleted successfully');
    }
}
