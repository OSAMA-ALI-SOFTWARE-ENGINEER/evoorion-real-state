<?php

namespace Database\Factories;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BlogPost>
 */
class BlogPostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'author_id'    => User::factory(),
            'title'        => $title,
            'slug'         => Str::slug($title) . '-' . fake()->unique()->numberBetween(1, 99999),
            'excerpt'      => fake()->paragraph(),
            'content'      => fake()->paragraphs(3, true),
            'status'       => 'draft',
            'published_at' => null,
            'view_count'   => 0,
            'reading_time' => '5 min read',
        ];
    }
}
