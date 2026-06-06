<?php

namespace Tests\Feature\Leads;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\LeadDocument;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class LeadDocumentTest extends TestCase
{
    private function mockCloudinary(): void
    {
        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldReceive('uploadDocument')
                ->andReturn([
                    'url'       => 'https://res.cloudinary.com/demo/leads/documents/test-uuid',
                    'public_id' => 'leads/documents/test-uuid',
                ]);
            $mock->shouldReceive('deleteMedia')->andReturn(null);
        });
    }

    private function fakePdf(): UploadedFile
    {
        return UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');
    }

    public function test_agent_can_list_documents_on_assigned_lead(): void
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        LeadDocument::factory()->count(3)->create([
            'lead_id' => $lead->id,
            'user_id' => $agent->user_id,
        ]);

        $response = $this->actingAs($agent->user)
            ->getJson("/api/v1/admin/leads/{$lead->id}/documents");

        $response->assertStatus(200)->assertJsonCount(3, 'data');
    }

    public function test_agent_cannot_list_documents_on_another_agents_lead(): void
    {
        $agent      = Agent::factory()->create();
        $otherAgent = Agent::factory()->create();
        $lead       = Lead::factory()->create(['assigned_to' => $otherAgent->user_id]);

        $response = $this->actingAs($agent->user)
            ->getJson("/api/v1/admin/leads/{$lead->id}/documents");

        $response->assertStatus(403);
    }

    public function test_agent_can_upload_document_to_assigned_lead(): void
    {
        $this->mockCloudinary();
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
                'file' => $this->fakePdf(),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'agreement.pdf')
            ->assertJsonStructure(['data' => ['id', 'name', 'url', 'public_id', 'mime_type', 'size', 'user']]);

        $this->assertDatabaseHas('lead_documents', [
            'lead_id' => $lead->id,
            'name'    => 'agreement.pdf',
        ]);
    }

    public function test_agent_cannot_upload_to_unassigned_lead(): void
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => null]);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
                'file' => $this->fakePdf(),
            ]);

        $response->assertStatus(403);
    }

    public function test_upload_rejects_disallowed_file_type(): void
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
                'file' => UploadedFile::fake()->create('malware.exe', 100, 'application/octet-stream'),
            ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['file']);
    }

    public function test_upload_rejects_file_over_10mb(): void
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
                'file' => UploadedFile::fake()->create('large.pdf', 11000, 'application/pdf'),
            ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['file']);
    }

    public function test_upload_rejected_when_lead_has_20_documents(): void
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        LeadDocument::factory()->count(20)->create([
            'lead_id' => $lead->id,
            'user_id' => $agent->user_id,
        ]);

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
                'file' => $this->fakePdf(),
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Lead has reached the 20 document limit');
    }

    public function test_manager_can_upload_on_any_lead(): void
    {
        $this->mockCloudinary();
        $manager = User::factory()->create(['role' => 'manager']);
        $lead    = Lead::factory()->create(['assigned_to' => null]);

        $response = $this->actingAs($manager)
            ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
                'file' => $this->fakePdf(),
            ]);

        $response->assertStatus(201);
    }

    public function test_agent_can_delete_document_from_assigned_lead(): void
    {
        $this->mockCloudinary();
        $agent    = Agent::factory()->create();
        $lead     = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $document = LeadDocument::factory()->create([
            'lead_id' => $lead->id,
            'user_id' => $agent->user_id,
        ]);

        $response = $this->actingAs($agent->user)
            ->deleteJson("/api/v1/admin/leads/{$lead->id}/documents/{$document->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('lead_documents', ['id' => $document->id]);
    }

    public function test_cannot_delete_document_from_different_lead(): void
    {
        $agent    = Agent::factory()->create();
        $lead1    = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $lead2    = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $document = LeadDocument::factory()->create([
            'lead_id' => $lead1->id,
            'user_id' => $agent->user_id,
        ]);

        $response = $this->actingAs($agent->user)
            ->deleteJson("/api/v1/admin/leads/{$lead2->id}/documents/{$document->id}");

        $response->assertStatus(404);
    }

    public function test_manager_can_delete_document_on_any_lead(): void
    {
        $this->mockCloudinary();
        $manager  = User::factory()->create(['role' => 'manager']);
        $lead     = Lead::factory()->create(['assigned_to' => null]);
        $document = LeadDocument::factory()->create([
            'lead_id' => $lead->id,
            'user_id' => $manager->id,
        ]);

        $response = $this->actingAs($manager)
            ->deleteJson("/api/v1/admin/leads/{$lead->id}/documents/{$document->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('lead_documents', ['id' => $document->id]);
    }
}
