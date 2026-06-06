<?php

namespace Tests\Feature\Agents;

use App\Models\Agency;
use App\Models\Agent;
use App\Models\User;
use Tests\TestCase;

class AgentCrudTest extends TestCase
{
    public function test_manager_can_create_agent()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agency  = Agency::factory()->create();

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/agents', [
            'name'                  => 'New Agent',
            'email'                 => 'newagent@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'agency_id'             => $agency->id,
            'phone'                 => '+971501234567',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.name', 'New Agent')
            ->assertJsonPath('data.user.role', 'agent');

        $this->assertDatabaseHas('users', ['email' => 'newagent@example.com', 'role' => 'agent']);
        $this->assertDatabaseHas('agents', ['agency_id' => $agency->id]);
    }

    public function test_agent_email_must_be_unique()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/agents', [
            'name'                  => 'Duplicate',
            'email'                 => 'taken@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_agent_can_list_agents()
    {
        $agent = Agent::factory()->create();
        Agent::factory(2)->create();

        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/agents');

        $response->assertStatus(200)->assertJsonStructure(['success', 'data', 'meta']);
    }

    public function test_agent_can_view_single_agent()
    {
        $viewer = Agent::factory()->create();
        $target = Agent::factory()->create();

        $response = $this->actingAs($viewer->user)->getJson("/api/v1/admin/agents/{$target->id}");

        $response->assertStatus(200)->assertJsonPath('data.id', $target->id);
    }

    public function test_manager_can_update_agent_name_and_agency()
    {
        $manager    = User::factory()->create(['role' => 'manager']);
        $agent      = Agent::factory()->create();
        $newAgency  = Agency::factory()->create();

        $response = $this->actingAs($manager)->putJson("/api/v1/admin/agents/{$agent->id}", [
            'name'      => 'Updated Name',
            'agency_id' => $newAgency->id,
        ]);

        $response->assertStatus(200)->assertJsonPath('data.user.name', 'Updated Name');
        $this->assertEquals($newAgency->id, $agent->fresh()->agency_id);
    }

    public function test_agent_cannot_create_another_agent()
    {
        $agent = Agent::factory()->create();

        $response = $this->actingAs($agent->user)->postJson('/api/v1/admin/agents', [
            'name'                  => 'Sneaky Agent',
            'email'                 => 'sneaky@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_manager_can_soft_delete_agent()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();

        $response = $this->actingAs($manager)->deleteJson("/api/v1/admin/agents/{$agent->id}");

        $response->assertStatus(200);
        $this->assertTrue($agent->fresh()->trashed());
    }

    public function test_manager_can_restore_agent()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        $agent->delete();

        $response = $this->actingAs($manager)->postJson("/api/v1/admin/agents/{$agent->id}/restore");

        $response->assertStatus(200);
        $this->assertFalse($agent->fresh()->trashed());
    }

    public function test_agents_filterable_by_agency()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agency  = Agency::factory()->create();
        Agent::factory(2)->create(['agency_id' => $agency->id]);
        Agent::factory(1)->create();

        $response = $this->actingAs($manager)->getJson("/api/v1/admin/agents?agency_id={$agency->id}");

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }
}
