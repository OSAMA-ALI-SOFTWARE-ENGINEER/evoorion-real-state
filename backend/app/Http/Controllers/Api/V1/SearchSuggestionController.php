<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Area;
use App\Models\Property;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchSuggestionController
{
    use ApiResponse;

    public function __invoke(Request $request): JsonResponse
    {
        $q     = trim($request->query('q', ''));
        $limit = min((int) $request->query('limit', 8), 20);

        if (strlen($q) < 2) {
            return $this->success(['areas' => [], 'properties' => []]);
        }

        $areas = Area::where('status', 'active')
            ->where('name', 'like', "%{$q}%")
            ->select('name', 'slug')
            ->withCount(['properties' => fn($query) => $query->where('status', '!=', 'sold')->where('is_active', true)])
            ->orderBy('name')
            ->limit(5)
            ->get()
            ->map(fn($a) => [
                'name'  => $a->name,
                'slug'  => $a->slug,
                'count' => $a->properties_count,
            ]);

        $properties = Property::where('is_active', true)
            ->where('status', '!=', 'sold')
            ->where('title', 'like', "%{$q}%")
            ->select('title', 'slug', 'type', 'price', 'currency')
            ->limit(max(1, $limit - $areas->count()))
            ->get()
            ->map(fn($p) => [
                'title'    => $p->title,
                'slug'     => $p->slug,
                'type'     => $p->type,
                'price'    => $p->currency . ' ' . number_format((float) $p->price, 0, '.', ','),
            ]);

        return $this->success([
            'areas'      => $areas,
            'properties' => $properties,
        ]);
    }
}
