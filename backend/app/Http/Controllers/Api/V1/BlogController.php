<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 9), 50);
        $tag     = $request->get('tag');
        $search  = $request->get('search');
        $region  = $request->get('region');

        $query = BlogPost::published()
            ->with(['author:id,name', 'tags:id,name,slug'])
            ->select([
                'id', 'author_id', 'title', 'slug', 'excerpt',
                'featured_image_url', 'published_at', 'updated_at', 'reading_time', 'view_count', 'region_id', 'is_featured',
            ])
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->orderByDesc('published_at');

        if ($tag) {
            $query->whereHas('tags', fn($q) => $q->where('slug', $tag));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($region) {
            $query->where(function ($q) use ($region) {
                $q->whereHas('region', fn($r) => $r->where('code', $region))
                  ->orWhereNull('region_id');
            });
        }

        $posts = $query->paginate($perPage);

        return $this->paginated(
            $posts->items(),
            $posts->total(),
            $posts->perPage(),
            $posts->currentPage(),
            'Blog posts retrieved'
        );
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::published()
            ->with(['author:id,name,avatar_url', 'tags:id,name,slug'])
            ->where('slug', $slug)
            ->firstOrFail();

        $post->increment('view_count');

        $related = BlogPost::published()
            ->whereHas('tags', fn($q) => $q->whereIn('blog_tags.id', $post->tags->pluck('id')))
            ->where('id', '!=', $post->id)
            ->with(['tags:id,name,slug'])
            ->select(['id', 'title', 'slug', 'excerpt', 'featured_image_url', 'published_at', 'updated_at', 'reading_time', 'is_featured'])
            ->limit(3)
            ->get();

        return $this->success([
            'post'    => $post,
            'related' => $related,
        ], 'Blog post retrieved');
    }

    public function tags(): JsonResponse
    {
        $tags = BlogTag::withCount(['posts' => fn($q) => $q->published()])
            ->having('posts_count', '>', 0)
            ->orderByDesc('posts_count')
            ->get();

        return $this->success($tags, 'Tags retrieved');
    }
}
