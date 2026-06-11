<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\PageContent;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $pages = PageContent::select('page_slug')
            ->distinct()
            ->orderBy('page_slug')
            ->pluck('page_slug');

        return $this->success($pages);
    }

    public function show(string $slug): JsonResponse
    {
        $sections = PageContent::where('page_slug', $slug)
            ->orderBy('section_key')
            ->get();

        return $this->success([
            'page_slug' => $slug,
            'sections'  => $sections,
        ]);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'sections'                  => 'required|array',
            'sections.*.section_key'    => 'required|string|max:100',
            'sections.*.content'        => 'required',
        ]);

        foreach ($data['sections'] as $section) {
            PageContent::updateOrCreate(
                ['page_slug' => $slug, 'section_key' => $section['section_key']],
                ['content'   => $section['content']]
            );
        }

        return $this->success(null, 'Page content saved');
    }

    public function destroySection(string $slug, string $key): JsonResponse
    {
        PageContent::where('page_slug', $slug)->where('section_key', $key)->delete();

        return $this->success(null, 'Section deleted');
    }
}
