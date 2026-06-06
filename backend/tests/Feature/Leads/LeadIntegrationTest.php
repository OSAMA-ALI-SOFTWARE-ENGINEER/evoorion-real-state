<?php

namespace Tests\Feature\Leads;

use App\Models\ActivityLog;
use App\Models\Agent;
use App\Models\Lead;
use App\Models\User;
use Tests\TestCase;

class LeadIntegrationTest extends TestCase
{
    // Task 3.10: Integration tests for lead assignment

    public function test_full_lead_lifecycle()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();

        // 1. Public submits a lead
        $storeResponse = $this->postJson('/api/v1/leads', [
            'name'   => 'Integration Test Lead',
            'email'  => 'integration@test.com',
            'phone'  => '0501234567',
            'source' => 'website',
        ]);

        $storeResponse->assertStatus(201);
        $leadId = $storeResponse->json('data.id');

        // 2. Agent views the unassigned lead
        $this->actingAs($agent->user)
            ->getJson("/api/v1/admin/leads/{$leadId}")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'new');

        // 2b. Manager assigns lead to agent
        $this->actingAs($manager)
            ->putJson("/api/v1/admin/leads/{$leadId}", ['assigned_to' => $agent->user_id])
            ->assertStatus(200);

        // 3. Agent updates status to contacted
        $this->actingAs($agent->user)
            ->putJson("/api/v1/admin/leads/{$leadId}", ['status' => 'contacted'])
            ->assertStatus(200);

        // 4. Agent adds a note
        $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$leadId}/notes", ['note' => 'Called the client, very interested'])
            ->assertStatus(201);

        // 5. Manager qualifies the lead
        $this->actingAs($manager)
            ->putJson("/api/v1/admin/leads/{$leadId}", ['status' => 'qualified'])
            ->assertStatus(200);

        // 6. Verify final state
        $lead = Lead::find($leadId);
        $this->assertEquals('qualified', $lead->status);
        $this->assertCount(1, $lead->notes);

        // 7. Verify activity log captured the lifecycle
        $this->assertDatabaseHas('activity_logs', ['action' => 'created', 'model_id' => $leadId]);
        $this->assertGreaterThanOrEqual(2, ActivityLog::where('model_id', $leadId)->where('action', 'updated')->count());
    }

    public function test_lead_assignment_workflow()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        $lead    = Lead::factory()->create(['assigned_to' => null]);

        // Manager assigns lead to agent
        $this->actingAs($manager)
            ->putJson("/api/v1/admin/leads/{$lead->id}", ['assigned_to' => $agent->user_id])
            ->assertStatus(200);

        $lead->refresh();
        $this->assertEquals($agent->user_id, $lead->assigned_to);

        // Agent can now see the lead
        $response = $this->actingAs($agent->user)
            ->getJson("/api/v1/admin/leads/{$lead->id}");

        $response->assertStatus(200);
        $this->assertEquals($agent->user_id, $response->json('data.assigned_to'));
    }

    public function test_soft_delete_and_restore_cycle()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        $lead    = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        // Agent soft-deletes
        $this->actingAs($agent->user)
            ->deleteJson("/api/v1/admin/leads/{$lead->id}")
            ->assertStatus(200);

        $this->assertTrue($lead->fresh()->trashed());

        // Deleted lead no longer visible in index
        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/leads');
        $ids = array_column($response->json('data'), 'id');
        $this->assertNotContains($lead->id, $ids);

        // Manager restores
        $this->actingAs($manager)
            ->postJson("/api/v1/admin/leads/{$lead->id}/restore")
            ->assertStatus(200);

        $this->assertFalse($lead->fresh()->trashed());
    }

    public function test_lead_notes_cascade_with_lead()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create();

        $lead->notes()->createMany([
            ['user_id' => $agent->user_id, 'note' => 'Note 1'],
            ['user_id' => $agent->user_id, 'note' => 'Note 2'],
        ]);

        // Soft delete lead — notes still exist (only cascade on hard delete)
        $lead->delete();
        $this->assertCount(2, $lead->notes()->withoutGlobalScopes()->get());

        // Hard delete removes notes via cascade
        $lead->forceDelete();
        $this->assertDatabaseMissing('lead_notes', ['lead_id' => $lead->id]);
    }

    // Task 3.11: Performance tests

    public function test_csv_export_with_large_dataset()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Lead::factory(50)->create();

        $start    = microtime(true);
        $response = $this->actingAs($manager)->getJson('/api/v1/admin/leads/export/csv');
        $elapsed  = microtime(true) - $start;

        $response->assertStatus(200);
        $this->assertLessThan(5.0, $elapsed, 'CSV export of 50 leads took longer than 5 seconds');
    }

    public function test_lead_index_pagination_performance()
    {
        $agent = Agent::factory()->create();
        Lead::factory(100)->create();

        $start    = microtime(true);
        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/leads?per_page=15');
        $elapsed  = microtime(true) - $start;

        $response->assertStatus(200);
        $this->assertLessThan(2.0, $elapsed, 'Lead index with 100 records took longer than 2 seconds');
        $this->assertEquals(15, count($response->json('data')));
    }

    public function test_lead_search_scope_performance()
    {
        $agent = Agent::factory()->create();
        Lead::factory(100)->create();
        Lead::factory()->create(['name' => 'Unique Search Target Name', 'email' => 'uniquetarget@perf.test']);

        $start    = microtime(true);
        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/leads?search=Unique+Search+Target');
        $elapsed  = microtime(true) - $start;

        $response->assertStatus(200);
        $this->assertLessThan(2.0, $elapsed, 'Lead search took longer than 2 seconds');
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_activity_log_index_performance_with_many_records()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        ActivityLog::factory(200)->create();

        $start    = microtime(true);
        $response = $this->actingAs($manager)->getJson('/api/v1/admin/activity-logs');
        $elapsed  = microtime(true) - $start;

        $response->assertStatus(200);
        $this->assertLessThan(2.0, $elapsed, 'Activity log index with 200 records took longer than 2 seconds');
    }
}
