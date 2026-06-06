<?php

namespace Tests\Feature\Properties;

use App\Models\Agent;
use App\Models\Property;
use App\Models\User;
use Tests\TestCase;

class PropertyAgentTest extends TestCase
{
    public function test_manager_can_assign_agent_to_property()
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $agent    = Agent::factory()->create();

        $response = $this->actingAs($manager)
            ->postJson("/api/v1/admin/properties/{$property->slug}/agents/{$agent->id}");

        $response->assertStatus(201)->assertJsonPath('success', true);
        $this->assertTrue(
            $property->agents()->where('agents.id', $agent->id)->exists()
        );
    }

    public function test_cannot_assign_same_agent_twice()
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $agent    = Agent::factory()->create();
        $property->agents()->attach($agent->id, ['assigned_at' => now()]);

        $response = $this->actingAs($manager)
            ->postJson("/api/v1/admin/properties/{$property->slug}/agents/{$agent->id}");

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_manager_can_unassign_agent()
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $agent    = Agent::factory()->create();
        $property->agents()->attach($agent->id, ['assigned_at' => now()]);

        $response = $this->actingAs($manager)
            ->deleteJson("/api/v1/admin/properties/{$property->slug}/agents/{$agent->id}");

        $response->assertStatus(200);
        $this->assertFalse(
            $property->agents()->where('agents.id', $agent->id)->exists()
        );
    }

    public function test_unassign_returns_404_if_not_assigned()
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $agent    = Agent::factory()->create();

        $response = $this->actingAs($manager)
            ->deleteJson("/api/v1/admin/properties/{$property->slug}/agents/{$agent->id}");

        $response->assertStatus(404);
    }

    public function test_agent_can_list_property_agents()
    {
        $viewer   = Agent::factory()->create();
        $property = Property::factory()->create();
        $agent1   = Agent::factory()->create();
        $agent2   = Agent::factory()->create();
        $property->agents()->attach([$agent1->id => ['assigned_at' => now()], $agent2->id => ['assigned_at' => now()]]);

        $response = $this->actingAs($viewer->user)
            ->getJson("/api/v1/admin/properties/{$property->slug}/agents");

        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_agent_cannot_assign_agents_to_properties()
    {
        $agent    = Agent::factory()->create();
        $property = Property::factory()->create();
        $other    = Agent::factory()->create();

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/properties/{$property->slug}/agents/{$other->id}");

        $response->assertStatus(403);
    }
}
