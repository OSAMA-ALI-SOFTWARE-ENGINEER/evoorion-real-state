<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\PropertyFilterRequest;
use App\Models\Property;
use App\Services\PropertyService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * @group Properties
 *
 * Browse, search, and view available properties. No authentication required.
 */
class PropertyController
{
    use ApiResponse;

    public function __construct(protected PropertyService $propertyService) {}

    /**
     * List properties
     *
     * Paginated list of available properties. Supports filtering, sorting, and search.
     *
     * @unauthenticated
     *
     * @queryParam search string Keyword search on title and description. Example: Palm Jumeirah
     * @queryParam area_id integer Filter by area ID. Example: 1
     * @queryParam operation_type_id integer Filter by operation type ID. Example: 1
     * @queryParam type string Filter by type. Allowed: villa, apartment, penthouse, townhouse, commercial. Example: villa
     * @queryParam featured boolean Show only featured properties. Example: true
     * @queryParam min_price number Minimum price. Example: 500000
     * @queryParam max_price number Maximum price. Example: 3000000
     * @queryParam developer_id integer Filter by developer ID. Example: 1
     * @queryParam bedrooms_min integer Minimum bedrooms. Example: 2
     * @queryParam bedrooms_max integer Maximum bedrooms. Example: 4
     * @queryParam bathrooms_min integer Minimum bathrooms. Example: 1
     * @queryParam sort_by string Field to sort by. Default: created_at. Example: price
     * @queryParam sort_direction string asc or desc. Default: desc. Example: asc
     * @queryParam per_page integer Items per page. Default: 15. Example: 15
     *
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {
     *       "id": 1,
     *       "title": "Luxury Villa in Palm Jumeirah",
     *       "slug": "luxury-villa-palm-jumeirah",
     *       "type": "villa",
     *       "price": "2500000.00",
     *       "currency": "AED",
     *       "bedrooms": 4,
     *       "bathrooms": 3,
     *       "area_sqft": "4500.00",
     *       "status": "available",
     *       "is_featured": true,
     *       "views_count": 120,
     *       "created_at": "2025-01-15T10:00:00.000000Z"
     *     }
     *   ],
     *   "message": "Operation successful",
     *   "meta": {
     *     "pagination": {
     *       "current_page": 1,
     *       "total": 42,
     *       "per_page": 15,
     *       "last_page": 3
     *     }
     *   }
     * }
     */
    public function index(PropertyFilterRequest $request): JsonResponse
    {
        $result = $this->propertyService->listProperties($request);

        return $this->paginated(
            $result['items'],
            $result['total'],
            $result['per_page'],
            $result['current_page']
        );
    }

    /**
     * Get property
     *
     * Retrieve a single property by slug. Increments the view count on each call.
     *
     * @unauthenticated
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": 1,
     *     "title": "Luxury Villa in Palm Jumeirah",
     *     "slug": "luxury-villa-palm-jumeirah",
     *     "description": "A stunning 4-bedroom villa with private pool and sea view.",
     *     "type": "villa",
     *     "price": "2500000.00",
     *     "currency": "AED",
     *     "bedrooms": 4,
     *     "bathrooms": 3,
     *     "area_sqft": "4500.00",
     *     "status": "available",
     *     "is_featured": true,
     *     "roi_min": "6.00",
     *     "roi_max": "8.00",
     *     "views_count": 121,
     *     "area": {"id": 1, "name": "Palm Jumeirah"},
     *     "developer": {"id": 1, "name": "Emaar Properties"},
     *     "operation_type": {"id": 1, "name": "For Sale"},
     *     "images": [
     *       {"id": 1, "url": "https://res.cloudinary.com/demo/image/upload/v1/villa.jpg", "is_primary": true}
     *     ],
     *     "amenities": [
     *       {"id": 1, "name": "Swimming Pool"},
     *       {"id": 2, "name": "Gym"}
     *     ],
     *     "created_at": "2025-01-15T10:00:00.000000Z",
     *     "updated_at": "2025-01-20T08:30:00.000000Z"
     *   },
     *   "message": "Operation successful",
     *   "meta": []
     * }
     * @response 404 scenario="Not found" {"message": "No query results for model [App\\Models\\Property]."}
     */
    public function show(Property $property): JsonResponse
    {
        if (!$property->is_active) {
            abort(404);
        }
        $this->propertyService->incrementViews($property->id);
        $property->load('images', 'amenities', 'area', 'developer', 'operationType');

        return $this->success($property);
    }
}
