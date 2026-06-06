<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;

/**
 * @group Users & Favorites
 *
 * Save and retrieve favorited properties for the authenticated user.
 */
class FavoritesController extends Controller
{
    public function index(): JsonResponse
    {
        $favorites = auth()->user()
            ->favoriteProperties()
            ->with('area', 'images')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $favorites->items(),
            'meta'    => [
                'total'        => $favorites->total(),
                'per_page'     => $favorites->perPage(),
                'current_page' => $favorites->currentPage(),
                'last_page'    => $favorites->lastPage(),
            ],
        ]);
    }

    public function store(Property $property): JsonResponse
    {
        $user = auth()->user();

        if ($user->favoriteProperties()->where('property_id', $property->id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Already in favorites'], 422);
        }

        $user->favoriteProperties()->attach($property->id);

        return response()->json(['success' => true, 'message' => 'Added to favorites'], 201);
    }

    public function destroy(Property $property): JsonResponse
    {
        $user = auth()->user();

        if (! $user->favoriteProperties()->where('property_id', $property->id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Not in favorites'], 404);
        }

        $user->favoriteProperties()->detach($property->id);

        return response()->json(['success' => true, 'message' => 'Removed from favorites']);
    }
}
