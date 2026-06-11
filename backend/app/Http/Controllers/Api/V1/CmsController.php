<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\PageContent;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class CmsController
{
    use ApiResponse;

    public function show(string $slug): JsonResponse
    {
        $sections = PageContent::where('page_slug', $slug)->get();

        $content = $sections->mapWithKeys(fn ($s) => [$s->section_key => $s->content]);

        return $this->success(['page_slug' => $slug, 'content' => $content]);
    }
}
