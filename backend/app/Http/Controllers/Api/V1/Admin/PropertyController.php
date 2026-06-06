<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\PropertyFilterRequest;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Services\PropertyService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * @group Properties
 *
 * Admin: full CRUD for property listings. Requires manager or super_admin role.
 */
class PropertyController
{
    use ApiResponse;

    public function __construct(protected PropertyService $propertyService) {}

    public function index(PropertyFilterRequest $request): JsonResponse
    {
        $query = Property::withTrashed()
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->area_id, fn ($q) => $q->byArea($request->integer('area_id')))
            ->when($request->developer_id, fn ($q) => $q->byDeveloper($request->integer('developer_id')))
            ->when($request->type, fn ($q) => $q->byType($request->type))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->featured, fn ($q) => $q->featured())
            ->when($request->bedrooms_min, fn ($q) => $q->where('bedrooms', '>=', $request->integer('bedrooms_min')))
            ->when($request->bedrooms_max, fn ($q) => $q->where('bedrooms', '<=', $request->integer('bedrooms_max')));

        $sortBy    = $request->input('sort_by', 'created_at');
        $sortDir   = $request->input('sort_direction', 'desc');
        $perPage   = $request->input('per_page', 15);
        $properties = $query->orderBy($sortBy, $sortDir)->paginate($perPage);

        return $this->paginated($properties->items(), $properties->total(), $perPage, $properties->currentPage());
    }

    public function show(Property $property): JsonResponse
    {
        $property->load('images', 'amenities', 'area', 'developer', 'operationType');

        return $this->success($property);
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $property = $this->propertyService->createProperty($request->validated());

        if ($request->filled('amenities')) {
            foreach ($request->input('amenities') as $amenity) {
                $property->amenities()->create(['amenity' => $amenity]);
            }
        }

        return $this->success($property, 'Property created successfully', 201);
    }

    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        $property = $this->propertyService->updateProperty($property, $request->validated());

        if ($request->filled('amenities')) {
            $property->amenities()->delete();
            foreach ($request->input('amenities') as $amenity) {
                $property->amenities()->create(['amenity' => $amenity]);
            }
        }

        return $this->success($property, 'Property updated successfully');
    }

    public function destroy(Property $property): JsonResponse
    {
        $this->propertyService->deleteProperty($property);

        return $this->success(null, 'Property deleted successfully');
    }

    public function restore(Property $property): JsonResponse
    {
        $this->propertyService->restoreProperty($property);

        return $this->success($property->fresh(), 'Property restored successfully');
    }
}
