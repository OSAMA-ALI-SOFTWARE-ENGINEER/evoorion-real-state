<?php

namespace Tests\Feature\Leads;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\LeadTask;
use App\Models\User;
use Tests\TestCase;

class LeadTaskTest extends TestCase
{
    public function test_agent_can_list_tasks_for_assigned_lead()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $lead->tasks()->createMany([
            ['user_id' => $agent->user_id, 'title' => 'Call client'],
            ['user_id' => $agent->user_id, 'title' => 'Send brochure'],
        ]);

        $response = $this->actingAs($agent->user)
            ->getJson("/api/v1/admin/leads/{$lead->id}/tasks");

        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_agent_can_create_task_on_assigned_lead()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/tasks", [
                'title'    => 'Schedule property viewing',
                'notes'    => 'Client prefers weekend mornings',
                'due_date' => now()->addDays(3)->toDateString(),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Schedule property viewing')
            ->assertJsonStructure(['data' => ['id', 'title', 'notes', 'due_date', 'completed_at', 'user']]);

        $this->assertDatabaseHas('lead_tasks', [
            'lead_id' => $lead->id,
            'title'   => 'Schedule property viewing',
        ]);
    }

    public function test_agent_cannot_create_task_on_unassigned_lead()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => null]);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/tasks", [
                'title' => 'Sneaky task',
            ]);

        $response->assertStatus(403);
    }

    public function test_agent_can_update_task()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $task  = $lead->tasks()->create(['user_id' => $agent->user_id, 'title' => 'Old title']);

        $response = $this->actingAs($agent->user)
            ->putJson("/api/v1/admin/leads/{$lead->id}/tasks/{$task->id}", [
                'title' => 'Updated title',
            ]);

        $response->assertStatus(200)->assertJsonPath('data.title', 'Updated title');
    }

    public function test_agent_can_delete_task()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $task  = $lead->tasks()->create(['user_id' => $agent->user_id, 'title' => 'To delete']);

        $response = $this->actingAs($agent->user)
            ->deleteJson("/api/v1/admin/leads/{$lead->id}/tasks/{$task->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('lead_tasks', ['id' => $task->id]);
    }

    public function test_agent_can_mark_task_complete()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $task  = $lead->tasks()->create(['user_id' => $agent->user_id, 'title' => 'Complete me']);

        $this->assertNull($task->completed_at);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/tasks/{$task->id}/complete");

        $response->assertStatus(200);
        $this->assertNotNull($task->fresh()->completed_at);
    }

    public function test_completing_task_twice_toggles_it_back()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $task  = $lead->tasks()->create(['user_id' => $agent->user_id, 'title' => 'Toggle me', 'completed_at' => now()]);

        $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/tasks/{$task->id}/complete");

        $this->assertNull($task->fresh()->completed_at);
    }

    public function test_cannot_tamper_task_from_different_lead()
    {
        $agent  = Agent::factory()->create();
        $lead1  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $lead2  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $task   = $lead1->tasks()->create(['user_id' => $agent->user_id, 'title' => 'Lead 1 task']);

        $response = $this->actingAs($agent->user)
            ->putJson("/api/v1/admin/leads/{$lead2->id}/tasks/{$task->id}", [
                'title' => 'Cross-lead tamper',
            ]);

        $response->assertStatus(404);
    }

    public function test_manager_can_manage_tasks_on_any_lead()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $lead    = Lead::factory()->create(['assigned_to' => null]);

        $response = $this->actingAs($manager)
            ->postJson("/api/v1/admin/leads/{$lead->id}/tasks", [
                'title' => 'Manager task',
            ]);

        $response->assertStatus(201);
    }

    public function test_task_due_date_must_not_be_in_past()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/tasks", [
                'title'    => 'Past task',
                'due_date' => now()->subDay()->toDateString(),
            ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['due_date']);
    }
}
