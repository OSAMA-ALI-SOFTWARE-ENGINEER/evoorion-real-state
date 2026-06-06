<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAmenityRequest;
use App\Http\Requests\UpdateAmenityRequest;
use App\Models\Property;
use App\Models\PropertyAmenity;
use Illuminate\Http\JsonResponse;

/**
 * @group Properties
 *
 * Admin: manage amenities attached to a specific property. Requires manager or super_admin role.
 */
class PropertyAmenityController extends Controller
{
    public function index(Property $property): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $property->amenities,
        ]);
    }

    public function store(Property $property, StoreAmenityRequest $request): JsonResponse
    {
        $amenity = $property->amenities()->create($request->validated());

        return response()->json(['success' => true, 'data' => $amenity], 201);
    }

    public function update(Property $property, PropertyAmenity $amenity, UpdateAmenityRequest $request): JsonResponse
    {
        if ($amenity->property_id !== $property->id) {
            return response()->json(['success' => false, 'message' => 'Amenity not found on this property'], 404);
        }

        $amenity->update($request->validated());

        return response()->json(['success' => true, 'data' => $amenity->fresh()]);
    }

    public function destroy(Property $property, PropertyAmenity $amenity): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('manager'), 403);

        if ($amenity->property_id !== $property->id) {
            return response()->json(['success' => false, 'message' => 'Amenity not found on this property'], 404);
        }

        $amenity->delete();

        return response()->json(['success' => true, 'message' => 'Amenity removed']);
    }
}
