<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $searches = auth()->user()
            ->savedSearches()
            ->latest()
            ->get();

        return $this->success($searches);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'    => 'required|string|max:100',
            'filters' => 'required|array',
        ]);

        $user = auth()->user();

        if ($user->savedSearches()->count() >= 10) {
            return $this->error('Maximum of 10 saved searches reached. Delete one to add another.', 422);
        }

        $search = $user->savedSearches()->create([
            'name'    => $request->name,
            'filters' => $request->filters,
        ]);

        return $this->success($search, 'Search saved successfully', 201);
    }

    public function destroy(SavedSearch $savedSearch): JsonResponse
    {
        if ($savedSearch->user_id !== auth()->id()) {
            return $this->error('Unauthorised', 403);
        }

        $savedSearch->delete();

        return $this->success(null, 'Saved search deleted');
    }
}
