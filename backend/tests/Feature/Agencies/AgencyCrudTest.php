<?php

namespace Tests\Feature\Agencies;

use App\Models\Agency;
use App\Models\Agent;
use App\Models\User;
use Tests\TestCase;

class AgencyCrudTest extends TestCase
{
    public function test_manager_can_create_agency()
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/agencies', [
            'name'          => 'Top Realty',
            'contact_email' => 'info@toprealty.com',
            'phone'         => '+971501234567',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.name', 'Top Realty');
        $this->assertDatabaseHas('agencies', ['name' => 'Top Realty']);
    }

    public function test_agency_name_must_be_unique()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Agency::factory()->create(['name' => 'Existing Agency']);

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/agencies', [
            'name' => 'Existing Agency',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['name']);
    }

    public function test_agent_can_list_agencies()
    {
        $agent = Agent::factory()->create();
        Agency::factory(3)->create();

        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/agencies');

        $response->assertStatus(200)->assertJsonStructure(['success', 'data', 'meta']);
    }

    public function test_agent_can_view_single_agency()
    {
        $agent  = Agent::factory()->create();
        $agency = Agency::factory()->create();

        $response = $this->actingAs($agent->user)->getJson("/api/v1/admin/agencies/{$agency->id}");

        $response->assertStatus(200)->assertJsonPath('data.id', $agency->id);
    }

    public function test_manager_can_update_agency()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agency  = Agency::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($manager)->putJson("/api/v1/admin/agencies/{$agency->id}", [
            'name' => 'New Name',
        ]);

        $response->assertStatus(200)->assertJsonPath('data.name', 'New Name');
    }

    public function test_agent_cannot_create_agency()
    {
        $agent = Agent::factory()->create();

        $response = $this->actingAs($agent->user)->postJson('/api/v1/admin/agencies', [
            'name' => 'Agent Agency',
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_delete_agency_with_agents()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agency  = Agency::factory()->create();
        Agent::factory()->create(['agency_id' => $agency->id]);

        $response = $this->actingAs($manager)->deleteJson("/api/v1/admin/agencies/{$agency->id}");

        $response->assertStatus(422)->assertJsonPath('message', 'Cannot delete agency with active agents');
    }

    public function test_manager_can_delete_empty_agency()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agency  = Agency::factory()->create();

        $response = $this->actingAs($manager)->deleteJson("/api/v1/admin/agencies/{$agency->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('agencies', ['id' => $agency->id]);
    }
}
