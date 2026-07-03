<?php

namespace Tests\Feature\Controllers;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\User;
use Tests\TestCase;

class LeadControllerTest extends TestCase
{
    public function test_public_store_lead()
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'source' => 'website',
        ];

        $response = $this->postJson('/api/v1/leads', $payload);

        $response->assertStatus(201)->assertJsonStructure([
            'success',
            'data' => ['id', 'name', 'email'],
            'message',
        ]);
    }

    public function test_admin_index_leads()
    {
        $agent = Agent::factory()->create();
        $user = $agent->user;
        Lead::factory(5)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/admin/leads');

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data',
            'meta',
        ]);
    }

    public function test_admin_show_lead()
    {
        $agent = Agent::factory()->create();
        $user = $agent->user;
        $lead = Lead::factory()->create();

        $response = $this->actingAs($user)
            ->getJson("/api/v1/admin/leads/{$lead->id}");

        $response->assertStatus(200)->assertJsonPath('data.id', $lead->id);
    }

    public function test_admin_update_lead_status()
    {
        $agent = Agent::factory()->create();
        $user = $agent->user;
        $lead = Lead::factory()->create(['status' => 'new', 'assigned_to' => $agent->user_id]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/admin/leads/{$lead->id}", [
                'status' => 'contacted',
            ]);

        $response->assertStatus(200);
        $this->assertEquals('contacted', $lead->fresh()->status);
    }

    public function test_admin_delete_lead()
    {
        $agent = Agent::factory()->create();
        $user = $agent->user;
        $lead = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/admin/leads/{$lead->id}");

        $response->assertStatus(200);
        $this->assertTrue($lead->fresh()->trashed());
    }

    public function test_admin_add_note_to_lead()
    {
        $agent = Agent::factory()->create();
        $user = $agent->user;
        $lead = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        $response = $this->actingAs($user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/notes", [
                'note' => 'Customer is very interested',
            ]);

        $response->assertStatus(201)->assertJsonStructure([
            'success',
            'data' => ['id', 'note', 'lead_id'],
        ]);
    }

    public function test_admin_get_lead_notes()
    {
        $agent = Agent::factory()->create();
        $user = $agent->user;
        $lead = Lead::factory()->create();
        $lead->notes()->createMany([
            ['user_id' => $user->id, 'note' => 'Note 1'],
            ['user_id' => $user->id, 'note' => 'Note 2'],
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/v1/admin/leads/{$lead->id}/notes");

        $response->assertStatus(200)->assertJsonStructure([
            'success',
            'data',
            'meta',
        ]);
    }

    public function test_manager_export_csv()
    {
        $user = User::factory()->create(['role' => 'manager']);
        Lead::factory(3)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/admin/leads/export/csv');

        $response->assertStatus(200);
    }

    public function test_lead_with_filled_honeypot_is_silently_discarded(): void
    {
        $this->postJson('/api/v1/leads', [
            'name' => 'Bot', 'email' => 'bot@spam.com', 'source' => 'website',
            'company_website' => 'https://spam.example',
        ])->assertStatus(201)->assertJsonPath('success', true);

        $this->assertDatabaseMissing('leads', ['email' => 'bot@spam.com']);
    }
}
