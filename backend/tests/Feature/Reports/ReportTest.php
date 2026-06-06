<?php

namespace Tests\Feature\Reports;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Tests\TestCase;

class ReportTest extends TestCase
{
    public function test_manager_can_view_lead_funnel()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Lead::factory(5)->create(['status' => 'new']);
        Lead::factory(3)->create(['status' => 'contacted']);
        Lead::factory(2)->create(['status' => 'closed']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/reports/lead-funnel');

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data' => ['funnel', 'total', 'conversion_rate', 'new_to_close_rate'],
        ]);

        $funnel  = collect($response->json('data.funnel'));
        $newRow  = $funnel->firstWhere('status', 'new');
        $this->assertGreaterThanOrEqual(5, $newRow['count']);
    }

    public function test_agent_can_view_lead_funnel()
    {
        $agent = Agent::factory()->create();

        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/reports/lead-funnel');

        $response->assertStatus(200);
    }

    public function test_leads_over_time_returns_series()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Lead::factory(3)->create();

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/reports/leads-over-time?days=7');

        $response->assertStatus(200);
        $this->assertCount(7, $response->json('data'));

        foreach ($response->json('data') as $point) {
            $this->assertArrayHasKey('date', $point);
            $this->assertArrayHasKey('total', $point);
        }
    }

    public function test_leads_over_time_caps_at_90_days()
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/reports/leads-over-time?days=200');

        $response->assertStatus(200);
        $this->assertCount(90, $response->json('data'));
    }

    public function test_property_performance_returns_top_properties()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Property::factory(3)->create(['views_count' => 100]);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/reports/property-performance');

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data' => ['*' => ['id', 'title', 'slug', 'views', 'leads', 'status']],
        ]);
    }

    public function test_agent_leaderboard_returns_agents_sorted_by_closed_leads()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $top     = Agent::factory()->create();
        $second  = Agent::factory()->create();
        Lead::factory(3)->create(['assigned_to' => $top->user_id, 'status' => 'closed']);
        Lead::factory(1)->create(['assigned_to' => $second->user_id, 'status' => 'closed']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/reports/agent-leaderboard');

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data' => ['*' => ['id', 'name', 'leads_total', 'leads_closed', 'close_rate']],
        ]);

        $data     = $response->json('data');
        $topAgent = collect($data)->firstWhere('id', $top->id);
        $this->assertGreaterThanOrEqual(3, $topAgent['leads_closed']);
    }

    public function test_leads_by_source_report()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Lead::factory(4)->create(['source' => 'website']);
        Lead::factory(2)->create(['source' => 'instagram']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/reports/leads-by-source');

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data' => ['*' => ['source', 'total']],
        ]);

        $websiteRow = collect($response->json('data'))->firstWhere('source', 'website');
        $this->assertGreaterThanOrEqual(4, $websiteRow['total']);
    }

    public function test_unauthenticated_cannot_access_reports()
    {
        $response = $this->getJson('/api/v1/admin/reports/lead-funnel');

        $response->assertStatus(401);
    }
}
