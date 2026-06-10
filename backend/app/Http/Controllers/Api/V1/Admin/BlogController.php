<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\User;
use App\Notifications\BlogPostPendingReview;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class BlogController
{
    use ApiResponse;

    private function isSuperAdmin(): bool
    {
        return auth()->user()?->hasRole('super_admin') ?? false;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 15), 50);

        $posts = BlogPost::withTrashed()
            ->with(['author:id,name', 'tags:id,name,slug'])
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($perPage);

        return $this->paginated(
            $posts->items(),
            $posts->total(),
            $posts->perPage(),
            $posts->currentPage(),
            'Blog posts retrieved'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'              => "required|string|max:255|unique:blog_posts,title",
            'slug'               => 'nullable|string|unique:blog_posts,slug',
            'excerpt'            => 'nullable|string',
            'content'            => 'required|string',
            'featured_image_url' => 'nullable|string|max:500',
            'status'             => 'required|in:draft,published,pending,archived',
            'published_at'       => 'nullable|date',
            'meta_title'         => 'nullable|string|max:60',
            'meta_description'   => 'nullable|string|max:160',
            'reading_time'       => 'nullable|string|max:20',
            'tag_ids'            => 'nullable|array',
            'tag_ids.*'          => 'integer|exists:blog_tags,id',
        ]);

        $data['slug']      = $data['slug'] ?? Str::slug($data['title']);
        $data['author_id'] = auth()->id();

        // Non-super-admin posts must go through approval
        if (!$this->isSuperAdmin()) {
            $data['status'] = 'pending';
        }

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $tagIds = $data['tag_ids'] ?? [];
        unset($data['tag_ids']);

        $post = BlogPost::create($data);
        if ($tagIds) {
            $post->tags()->sync($tagIds);
        }

        $post->load(['author:id,name', 'tags:id,name,slug']);

        // Notify all super admins when a post needs review
        if ($post->status === 'pending') {
            $superAdmins = User::where('role', 'super_admin')->get();
            if ($superAdmins->isNotEmpty()) {
                Notification::send($superAdmins, new BlogPostPendingReview($post));
            }
        }

        return $this->success($post, 'Post created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $post = BlogPost::withTrashed()
            ->with(['author:id,name', 'tags:id,name,slug'])
            ->findOrFail($id);

        return $this->success($post);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'title'              => "sometimes|string|max:255|unique:blog_posts,title,{$id}",
            'slug'               => "sometimes|string|unique:blog_posts,slug,{$id}",
            'excerpt'            => 'nullable|string',
            'content'            => 'sometimes|string',
            'featured_image_url' => 'nullable|string|max:500',
            'status'             => 'sometimes|in:draft,published,pending,archived',
            'published_at'       => 'nullable|date',
            'meta_title'         => 'nullable|string|max:60',
            'meta_description'   => 'nullable|string|max:160',
            'reading_time'       => 'nullable|string|max:20',
            'tag_ids'            => 'nullable|array',
            'tag_ids.*'          => 'integer|exists:blog_tags,id',
        ]);

        if (isset($data['title']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        // Non-super-admin cannot self-publish or restore archived posts; archiving is allowed
        if (isset($data['status']) && !$this->isSuperAdmin() && in_array($data['status'], ['published', 'draft'])) {
            $data['status'] = 'pending';
        }

        if (isset($data['status']) && $data['status'] === 'published' && empty($post->published_at)) {
            $data['published_at'] = $data['published_at'] ?? now();
        }

        $tagIds = $data['tag_ids'] ?? null;
        unset($data['tag_ids']);

        $post->update($data);
        if ($tagIds !== null) {
            $post->tags()->sync($tagIds);
        }

        return $this->success($post->fresh()->load(['author:id,name', 'tags:id,name,slug']), 'Post updated');
    }

    public function approve(int $id): JsonResponse
    {
        abort_unless($this->isSuperAdmin(), 403, 'Only super admins can approve posts');

        $post = BlogPost::findOrFail($id);
        $post->update([
            'status'       => 'published',
            'published_at' => $post->published_at ?? now(),
        ]);

        return $this->success($post->fresh()->load(['author:id,name', 'tags:id,name,slug']), 'Post approved');
    }

    public function destroy(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return $this->success(null, 'Post deleted');
    }

    public function restore(int $id): JsonResponse
    {
        $post = BlogPost::onlyTrashed()->findOrFail($id);
        $post->restore();

        return $this->success($post, 'Post restored');
    }

    // ── Tags ──────────────────────────────────────────────────────────────────

    public function tags(): JsonResponse
    {
        $tags = BlogTag::withCount('posts')->orderBy('name')->get();

        return $this->success($tags);
    }

    public function storeTag(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:blog_tags,name',
            'slug' => 'nullable|string|unique:blog_tags,slug',
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $tag = BlogTag::create($data);

        return $this->success($tag, 'Tag created', 201);
    }

    public function updateTag(Request $request, BlogTag $tag): JsonResponse
    {
        $data = $request->validate([
            'name' => "sometimes|string|max:100|unique:blog_tags,name,{$tag->id}",
            'slug' => "sometimes|string|unique:blog_tags,slug,{$tag->id}",
        ]);

        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $tag->update($data);

        return $this->success($tag->fresh(), 'Tag updated');
    }

    public function destroyTag(BlogTag $tag): JsonResponse
    {
        $tag->delete();

        return $this->success(null, 'Tag deleted');
    }
}
