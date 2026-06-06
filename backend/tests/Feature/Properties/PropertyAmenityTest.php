<?php

namespace Tests\Feature\Properties;

use App\Models\Agent;
use App\Models\Property;
use App\Models\PropertyAmenity;
use App\Models\User;
use Tests\TestCase;

class PropertyAmenityTest extends TestCase
{
    public function test_agent_can_list_property_amenities()
    {
        $agent    = Agent::factory()->create();
        $property = Property::factory()->create();
        $property->amenities()->createMany([
            ['amenity' => 'Swimming Pool'],
            ['amenity' => 'Gym'],
        ]);

        $response = $this->actingAs($agent->user)
            ->getJson("/api/v1/admin/properties/{$property->slug}/amenities");

        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_manager_can_add_amenity_to_property()
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();

        $response = $this->actingAs($manager)
            ->postJson("/api/v1/admin/properties/{$property->slug}/amenities", [
                'amenity' => 'Rooftop Terrace',
            ]);

        $response->assertStatus(201)->assertJsonPath('data.amenity', 'Rooftop Terrace');
        $this->assertDatabaseHas('property_amenities', [
            'property_id' => $property->id,
            'amenity'     => 'Rooftop Terrace',
        ]);
    }

    public function test_manager_can_update_amenity()
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $amenity  = $property->amenities()->create(['amenity' => 'Old Name']);

        $response = $this->actingAs($manager)
            ->putJson("/api/v1/admin/properties/{$property->slug}/amenities/{$amenity->id}", [
                'amenity' => 'Updated Name',
            ]);

        $response->assertStatus(200)->assertJsonPath('data.amenity', 'Updated Name');
    }

    public function test_manager_can_delete_amenity()
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $amenity  = $property->amenities()->create(['amenity' => 'To Be Removed']);

        $response = $this->actingAs($manager)
            ->deleteJson("/api/v1/admin/properties/{$property->slug}/amenities/{$amenity->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('property_amenities', ['id' => $amenity->id]);
    }

    public function test_agent_cannot_add_amenity()
    {
        $agent    = Agent::factory()->create();
        $property = Property::factory()->create();

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/properties/{$property->slug}/amenities", [
                'amenity' => 'Unauthorized',
            ]);

        $response->assertStatus(403);
    }

    public function test_agent_cannot_delete_amenity()
    {
        $agent    = Agent::factory()->create();
        $property = Property::factory()->create();
        $amenity  = $property->amenities()->create(['amenity' => 'Protected']);

        $response = $this->actingAs($agent->user)
            ->deleteJson("/api/v1/admin/properties/{$property->slug}/amenities/{$amenity->id}");

        $response->assertStatus(403);
    }

    public function test_amenity_validation_requires_amenity_field()
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();

        $response = $this->actingAs($manager)
            ->postJson("/api/v1/admin/properties/{$property->slug}/amenities", []);

        $response->assertStatus(422)->assertJsonValidationErrors(['amenity']);
    }

    public function test_cannot_update_amenity_from_different_property()
    {
        $manager   = User::factory()->create(['role' => 'manager']);
        $property1 = Property::factory()->create();
        $property2 = Property::factory()->create();
        $amenity   = $property1->amenities()->create(['amenity' => 'Belongs to Property 1']);

        $response = $this->actingAs($manager)
            ->putJson("/api/v1/admin/properties/{$property2->slug}/amenities/{$amenity->id}", [
                'amenity' => 'Cross-property attempt',
            ]);

        $response->assertStatus(404);
    }
}
