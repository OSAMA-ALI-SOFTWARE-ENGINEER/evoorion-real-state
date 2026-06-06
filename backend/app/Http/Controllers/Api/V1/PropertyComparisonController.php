<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * @group Properties
 *
 * Compare 2–4 properties side by side.
 */
class PropertyComparisonController extends Controller
{
    /**
     * Compare properties
     *
     * Compare 2 to 4 available properties by slug. Returns them in the requested order
     * plus a summary identifying the cheapest, most bedrooms, and largest by sqft.
     *
     * @unauthenticated
     *
     * @bodyParam slugs string[] required Array of 2–4 property slugs to compare. Example: ["luxury-villa-palm-jumeirah","city-apartment-downtown"]
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "properties": [
     *       {
     *         "id": 1, "title": "Luxury Villa", "slug": "luxury-villa-palm-jumeirah",
     *         "price": "2500000.00", "bedrooms": 4, "bathrooms": 3, "area_sqft": "4500.00", "type": "villa"
     *       },
     *       {
     *         "id": 2, "title": "City Apartment", "slug": "city-apartment-downtown",
     *         "price": "800000.00", "bedrooms": 2, "bathrooms": 2, "area_sqft": "1200.00", "type": "apartment"
     *       }
     *     ],
     *     "summary": {
     *       "cheapest": "city-apartment-downtown",
     *       "most_bedrooms": "luxury-villa-palm-jumeirah",
     *       "largest": "luxury-villa-palm-jumeirah"
     *     }
     *   }
     * }
     * @response 422 scenario="Fewer than 2 available slugs" {
     *   "success": false,
     *   "message": "At least 2 available properties are required for comparison"
     * }
     */
    public function compare(Request $request): JsonResponse
    {
        $request->validate([
            'slugs'   => 'required|array|min:2|max:4',
            'slugs.*' => 'required|string|exists:properties,slug',
        ]);

        $properties = Property::whereIn('slug', $request->slugs)
            ->with('area', 'developer', 'operationType', 'amenities', 'images')
            ->available()
            ->get()
            ->keyBy('slug');

        // Return in the same order as requested
        $ordered = collect($request->slugs)
            ->filter(fn ($slug) => $properties->has($slug))
            ->map(fn ($slug) => $properties[$slug])
            ->values();

        if ($ordered->count() < 2) {
            return response()->json([
                'success' => false,
                'message' => 'At least 2 available properties are required for comparison',
            ], 422);
        }

        $fields = ['price', 'currency', 'bedrooms', 'bathrooms', 'area_sqft', 'roi_min', 'roi_max', 'type', 'status'];

        $comparison = [
            'properties' => $ordered,
            'summary'    => [
                'cheapest'      => $ordered->sortBy('price')->first()->slug,
                'most_bedrooms' => $ordered->sortByDesc('bedrooms')->first()->slug,
                'largest'       => $ordered->sortByDesc('area_sqft')->first()->slug,
            ],
        ];

        return response()->json(['success' => true, 'data' => $comparison]);
    }
}
