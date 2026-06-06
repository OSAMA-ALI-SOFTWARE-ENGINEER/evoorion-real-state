<?php

namespace Tests\Feature\Dashboard;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function test_manager_can_view_dashboard_stats()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Lead::factory(5)->create(['status' => 'new']);
        Lead::factory(3)->create(['status' => 'closed']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data' => [
                'leads'      => ['total', 'unassigned', 'this_month', 'last_month', 'by_status', 'by_source'],
                'agents'     => ['total', 'active'],
                'properties' => ['total', 'available', 'featured'],
            ],
        ]);

        $this->assertGreaterThanOrEqual(8, $response->json('data.leads.total'));
    }

    public function test_agent_can_view_dashboard_stats()
    {
        $agent = Agent::factory()->create();

        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(200)->assertJsonPath('success', true);
    }

    public function test_unauthenticated_cannot_view_stats()
    {
        $response = $this->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(401);
    }

    public function test_manager_can_view_agent_performance()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        Lead::factory(3)->create(['assigned_to' => $agent->user_id, 'status' => 'contacted']);
        Lead::factory(2)->create(['assigned_to' => $agent->user_id, 'status' => 'closed']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/dashboard/agent-performance');

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'name', 'email', 'properties', 'leads_total', 'leads_closed', 'close_rate'],
            ],
        ]);

        $agentData = collect($response->json('data'))->firstWhere('id', $agent->id);
        $this->assertNotNull($agentData);
        $this->assertEquals(5, $agentData['leads_total']);
        $this->assertEquals(2, $agentData['leads_closed']);
        $this->assertEquals(40.0, $agentData['close_rate']);
    }

    public function test_stats_by_status_are_accurate()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Lead::factory(4)->create(['status' => 'new']);
        Lead::factory(2)->create(['status' => 'qualified']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/dashboard/stats');

        $byStatus = $response->json('data.leads.by_status');
        $this->assertArrayHasKey('new', $byStatus);
        $this->assertArrayHasKey('qualified', $byStatus);
    }
}
