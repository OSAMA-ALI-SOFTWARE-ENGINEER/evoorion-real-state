<?php

namespace Tests\Feature\Blog;

use App\Models\BlogPost;
use Tests\TestCase;

class BlogPublicTest extends TestCase
{
    public function test_blog_index_can_filter_featured(): void
    {
        BlogPost::factory()->create(['status' => 'published', 'published_at' => now()->subDay(), 'is_featured' => true, 'title' => 'Star Post']);
        BlogPost::factory()->create(['status' => 'published', 'published_at' => now()->subDay(), 'is_featured' => false]);

        $this->getJson('/api/v1/blog?featured=1')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Star Post');
    }
}
