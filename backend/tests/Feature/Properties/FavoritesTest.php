<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use App\Models\User;
use Tests\TestCase;

class FavoritesTest extends TestCase
{
    private function registerUser(): array
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Test User',
            'email'                 => 'favuser' . uniqid() . '@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);
        return [
            'user'  => User::find($response->json('data.user.id')),
            'token' => $response->json('data.token'),
        ];
    }

    public function test_authenticated_user_can_add_favorite()
    {
        ['user' => $user] = $this->registerUser();
        $property = Property::factory()->create();

        $response = $this->actingAs($user)
            ->postJson("/api/v1/favorites/{$property->slug}");

        $response->assertStatus(201)->assertJsonPath('success', true);
        $this->assertTrue($user->favoriteProperties()->where('property_id', $property->id)->exists());
    }

    public function test_cannot_add_same_favorite_twice()
    {
        ['user' => $user] = $this->registerUser();
        $property = Property::factory()->create();
        $user->favoriteProperties()->attach($property->id);

        $response = $this->actingAs($user)
            ->postJson("/api/v1/favorites/{$property->slug}");

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_remove_favorite()
    {
        ['user' => $user] = $this->registerUser();
        $property = Property::factory()->create();
        $user->favoriteProperties()->attach($property->id);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/favorites/{$property->slug}");

        $response->assertStatus(200);
        $this->assertFalse($user->favoriteProperties()->where('property_id', $property->id)->exists());
    }

    public function test_remove_nonexistent_favorite_returns_404()
    {
        ['user' => $user] = $this->registerUser();
        $property = Property::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/favorites/{$property->slug}");

        $response->assertStatus(404);
    }

    public function test_user_can_list_favorites()
    {
        ['user' => $user] = $this->registerUser();
        $p1 = Property::factory()->create();
        $p2 = Property::factory()->create();
        $user->favoriteProperties()->attach([$p1->id, $p2->id]);

        $response = $this->actingAs($user)->getJson('/api/v1/favorites');

        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_unauthenticated_user_cannot_use_favorites()
    {
        $property = Property::factory()->create();

        $response = $this->postJson("/api/v1/favorites/{$property->slug}");

        $response->assertStatus(401);
    }

    public function test_favorites_are_user_scoped()
    {
        ['user' => $user1] = $this->registerUser();
        ['user' => $user2] = $this->registerUser();
        $property = Property::factory()->create();

        $user1->favoriteProperties()->attach($property->id);

        $response = $this->actingAs($user2)->getJson('/api/v1/favorites');

        $response->assertStatus(200)->assertJsonCount(0, 'data');
    }
}
