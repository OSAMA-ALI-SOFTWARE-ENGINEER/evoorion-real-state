<?php

namespace App\Services;

use App\Http\Requests\PropertyFilterRequest;
use App\Models\Property;
use Illuminate\Support\Facades\Cache;

class PropertyService
{
    public function createProperty(array $data): Property
    {
        $property = Property::create($data);
        $this->invalidateCache();
        return $property;
    }

    public function updateProperty(Property $property, array $data): Property
    {
        $property->update($data);
        $this->invalidateCache();
        return $property;
    }

    public function deleteProperty(Property $property): void
    {
        $property->delete();
        $this->invalidateCache();
    }

    public function restoreProperty(Property $property): void
    {
        $property->restore();
        $this->invalidateCache();
    }

    public function listProperties(PropertyFilterRequest $request): array
    {
        $params = $request->only([
            'search', 'area_id', 'operation_type_id', 'type', 'featured',
            'min_price', 'max_price', 'developer_id', 'bedrooms_min', 'bedrooms_max',
            'bathrooms_min', 'bathrooms_max', 'sort_by', 'sort_direction', 'per_page', 'page',
        ]);

        // Normalize featured: treat false/0/'0'/'' identically to absent
        if (isset($params['featured']) && !filter_var($params['featured'], FILTER_VALIDATE_BOOLEAN)) {
            unset($params['featured']);
        }

        ksort($params);
        $key = 'properties:list:' . md5(json_encode($params));

        return Cache::tags(['properties'])->remember($key, 3600, function () use ($request) {
            $query = Property::available()->where('is_active', true);

            if ($request->filled('search')) {
                $query = $query->search($request->input('search'));
            }
            if ($request->filled('area_id')) {
                $query = $query->byArea($request->input('area_id'));
            }
            if ($request->filled('operation_type_id')) {
                $query = $query->byOperationType($request->input('operation_type_id'));
            }
            if ($request->filled('type')) {
                $query = $query->byType($request->input('type'));
            }
            if ($request->boolean('featured')) {
                $query = $query->featured();
            }
            if ($request->filled('min_price') && $request->filled('max_price')) {
                $query = $query->priceRange(
                    $request->input('min_price'),
                    $request->input('max_price')
                );
            }
            if ($request->filled('developer_id')) {
                $query = $query->byDeveloper($request->input('developer_id'));
            }
            if ($request->filled('bedrooms_min')) {
                $query = $query->where('bedrooms', '>=', $request->integer('bedrooms_min'));
            }
            if ($request->filled('bedrooms_max')) {
                $query = $query->where('bedrooms', '<=', $request->integer('bedrooms_max'));
            }
            if ($request->filled('bathrooms_min')) {
                $query = $query->where('bathrooms', '>=', $request->integer('bathrooms_min'));
            }
            if ($request->filled('bathrooms_max')) {
                $query = $query->where('bathrooms', '<=', $request->integer('bathrooms_max'));
            }

            $sortBy        = $request->input('sort_by', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            $perPage       = $request->input('per_page', 15);

            $paginated = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);

            return [
                'items'        => $paginated->items(),
                'total'        => $paginated->total(),
                'per_page'     => (int) $perPage,
                'current_page' => $paginated->currentPage(),
            ];
        });
    }

    public function incrementViews(int $propertyId): void
    {
        Property::whereKey($propertyId)->increment('views_count');
    }

    public function getViewCount(int $propertyId): int
    {
        return (int) Property::whereKey($propertyId)->value('views_count');
    }

    public function getCachedPropertiesByArea(int $areaId)
    {
        return Cache::tags(['properties', "area:{$areaId}"])->remember(
            "properties:area:{$areaId}",
            3600,
            fn() => Property::where('area_id', $areaId)->available()->where('is_active', true)->get()
        );
    }

    public function getCachedPropertiesByDeveloper(int $developerId)
    {
        return Cache::tags(['properties', "developer:{$developerId}"])->remember(
            "properties:developer:{$developerId}",
            3600,
            fn() => Property::where('developer_id', $developerId)->available()->where('is_active', true)->get()
        );
    }

    protected function invalidateCache(): void
    {
        Cache::tags(['properties'])->flush();
    }
}
