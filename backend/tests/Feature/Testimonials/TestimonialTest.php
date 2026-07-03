<?php

namespace Tests\Feature\Testimonials;

use App\Models\Testimonial;
use App\Models\User;
use Tests\TestCase;

class TestimonialTest extends TestCase
{
    public function test_manager_can_create_testimonial(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/testimonials', [
            'author_name'  => 'Fatima Al Mansouri',
            'author_title' => 'Investor, Downtown Dubai',
            'quote'        => 'EVOORION handled everything from viewing to handover flawlessly.',
            'rating'       => 5,
        ]);

        $response->assertStatus(201)->assertJsonPath('data.author_name', 'Fatima Al Mansouri');
        $this->assertDatabaseHas('testimonials', ['author_name' => 'Fatima Al Mansouri', 'is_active' => true]);
    }

    public function test_agent_cannot_create_testimonial(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($agent)->postJson('/api/v1/admin/testimonials', [
            'author_name' => 'X', 'quote' => 'Y',
        ])->assertStatus(403);
    }

    public function test_public_endpoint_returns_only_active_ordered(): void
    {
        Testimonial::create(['author_name' => 'B', 'quote' => 'Second', 'sort_order' => 2]);
        Testimonial::create(['author_name' => 'A', 'quote' => 'First', 'sort_order' => 1]);
        Testimonial::create(['author_name' => 'Hidden', 'quote' => 'Nope', 'is_active' => false]);

        $response = $this->getJson('/api/v1/testimonials');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.author_name', 'A')
            ->assertJsonPath('data.1.author_name', 'B');
    }

    public function test_manager_can_update_and_delete(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $t = Testimonial::create(['author_name' => 'Old', 'quote' => 'Q']);

        $this->actingAs($manager)->putJson("/api/v1/admin/testimonials/{$t->id}", ['author_name' => 'New'])
            ->assertStatus(200)->assertJsonPath('data.author_name', 'New');

        $this->actingAs($manager)->deleteJson("/api/v1/admin/testimonials/{$t->id}")->assertStatus(200);
        $this->assertDatabaseMissing('testimonials', ['id' => $t->id]);
    }

    public function test_testimonial_changes_are_activity_logged(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)->postJson('/api/v1/admin/testimonials', [
            'author_name' => 'Logged', 'quote' => 'Q',
        ]);

        $this->assertDatabaseHas('activity_logs', ['model_type' => 'Testimonial', 'action' => 'created']);
    }
}
