<?php

namespace Tests\Feature\Leads;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\User;
use Tests\TestCase;

class BulkLeadTest extends TestCase
{
    public function test_manager_can_bulk_update_status()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $leads   = Lead::factory(3)->create(['status' => 'new']);

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/leads/bulk/status', [
            'ids'    => $leads->pluck('id')->toArray(),
            'status' => 'contacted',
        ]);

        $response->assertStatus(200)->assertJsonPath('updated', 3);
        $this->assertEquals(3, Lead::whereIn('id', $leads->pluck('id'))->where('status', 'contacted')->count());
    }

    public function test_manager_can_bulk_assign_leads()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        $leads   = Lead::factory(4)->create(['assigned_to' => null]);

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/leads/bulk/assign', [
            'ids'         => $leads->pluck('id')->toArray(),
            'assigned_to' => $agent->user_id,
        ]);

        $response->assertStatus(200)->assertJsonPath('updated', 4);
        $this->assertEquals(4, Lead::whereIn('id', $leads->pluck('id'))
            ->where('assigned_to', $agent->user_id)->count());
    }

    public function test_manager_can_bulk_delete_leads()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $leads   = Lead::factory(3)->create();

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/leads/bulk/delete', [
            'ids' => $leads->pluck('id')->toArray(),
        ]);

        $response->assertStatus(200)->assertJsonPath('deleted', 3);
        $this->assertEquals(3, Lead::onlyTrashed()->whereIn('id', $leads->pluck('id'))->count());
    }

    public function test_manager_can_bulk_restore_leads()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $leads   = Lead::factory(2)->create();
        Lead::whereIn('id', $leads->pluck('id'))->delete();

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/leads/bulk/restore', [
            'ids' => $leads->pluck('id')->toArray(),
        ]);

        $response->assertStatus(200)->assertJsonPath('restored', 2);
        $this->assertEquals(0, Lead::onlyTrashed()->whereIn('id', $leads->pluck('id'))->count());
    }

    public function test_agent_cannot_bulk_update()
    {
        $agent = Agent::factory()->create();
        $leads = Lead::factory(2)->create();

        $response = $this->actingAs($agent->user)->postJson('/api/v1/admin/leads/bulk/status', [
            'ids'    => $leads->pluck('id')->toArray(),
            'status' => 'contacted',
        ]);

        $response->assertStatus(403);
    }

    public function test_bulk_status_requires_valid_status()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $leads   = Lead::factory(2)->create();

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/leads/bulk/status', [
            'ids'    => $leads->pluck('id')->toArray(),
            'status' => 'invalid_status',
        ]);

        $response->assertStatus(422);
    }

    public function test_bulk_operations_reject_more_than_100_ids()
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/leads/bulk/status', [
            'ids'    => range(1, 101),
            'status' => 'contacted',
        ]);

        $response->assertStatus(422);
    }
}
