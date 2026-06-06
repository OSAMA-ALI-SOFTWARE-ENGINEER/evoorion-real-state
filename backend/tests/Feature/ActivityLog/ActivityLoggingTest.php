<?php

namespace Tests\Feature\ActivityLog;

use App\Models\ActivityLog;
use App\Models\Agent;
use App\Models\Lead;
use App\Models\User;
use Tests\TestCase;

class ActivityLoggingTest extends TestCase
{
    public function test_lead_creation_logs_activity()
    {
        $this->postJson('/api/v1/leads', [
            'name'   => 'Jane Doe',
            'email'  => 'jane@example.com',
            'source' => 'website',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action'     => 'created',
            'model_type' => 'Lead',
        ]);
    }

    public function test_lead_update_logs_activity_with_changes()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['status' => 'new', 'assigned_to' => $agent->user_id]);

        $this->actingAs($agent->user)
            ->putJson("/api/v1/admin/leads/{$lead->id}", ['status' => 'contacted']);

        $log = ActivityLog::where('action', 'updated')
            ->where('model_type', 'Lead')
            ->where('model_id', $lead->id)
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals('new', $log->changes['before']['status']);
        $this->assertEquals('contacted', $log->changes['after']['status']);
    }

    public function test_lead_delete_logs_activity()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        $this->actingAs($agent->user)
            ->deleteJson("/api/v1/admin/leads/{$lead->id}");

        $this->assertDatabaseHas('activity_logs', [
            'action'     => 'deleted',
            'model_type' => 'Lead',
            'model_id'   => $lead->id,
        ]);
    }

    public function test_lead_restore_logs_activity()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $lead    = Lead::factory()->create();
        $lead->delete();

        $this->actingAs($manager)
            ->postJson("/api/v1/admin/leads/{$lead->id}/restore");

        $this->assertDatabaseHas('activity_logs', [
            'action'     => 'restored',
            'model_type' => 'Lead',
            'model_id'   => $lead->id,
        ]);
    }

    public function test_manager_can_view_activity_logs()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        ActivityLog::factory(3)->create(['model_type' => 'Lead']);

        $response = $this->actingAs($manager)
            ->getJson('/api/v1/admin/activity-logs');

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data',
            'meta',
        ]);
    }

    public function test_activity_logs_filterable_by_model_type()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        ActivityLog::factory(2)->create(['model_type' => 'Lead']);
        ActivityLog::factory(1)->create(['model_type' => 'Property']);

        $response = $this->actingAs($manager)
            ->getJson('/api/v1/admin/activity-logs?model_type=Lead');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $log) {
            $this->assertEquals('Lead', $log['model_type']);
        }
    }

    public function test_agent_cannot_view_activity_logs()
    {
        $agent = Agent::factory()->create();

        $response = $this->actingAs($agent->user)
            ->getJson('/api/v1/admin/activity-logs');

        $response->assertStatus(403);
    }

    public function test_no_activity_logged_when_no_changes_on_update()
    {
        $lead = Lead::factory()->create(['status' => 'new']);

        $initialCount = ActivityLog::where('action', 'updated')->where('model_id', $lead->id)->count();

        // Update with same value — observer should skip logging
        $lead->update(['status' => 'new']);

        $finalCount = ActivityLog::where('action', 'updated')->where('model_id', $lead->id)->count();

        $this->assertEquals($initialCount, $finalCount);
    }
}
