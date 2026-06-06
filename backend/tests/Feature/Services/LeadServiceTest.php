<?php

namespace Tests\Feature\Services;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\User;
use App\Services\LeadService;
use Tests\TestCase;

class LeadServiceTest extends TestCase
{
    private LeadService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(LeadService::class);
    }

    public function test_create_lead()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'whatsapp' => '1234567890',
            'budget_min' => 100000,
            'budget_max' => 500000,
            'message' => 'Interested in luxury properties',
            'source' => 'website',
            'status' => 'new',
        ];

        $lead = $this->service->createLead($data);

        $this->assertInstanceOf(Lead::class, $lead);
        $this->assertEquals('John Doe', $lead->name);
        $this->assertDatabaseHas('leads', ['email' => 'john@example.com']);
    }

    public function test_assign_lead_to_agent()
    {
        $lead = Lead::factory()->create(['assigned_to' => null]);
        $agent = Agent::factory()->create();

        $updated = $this->service->assignLead($lead->id, $agent->id);

        $this->assertEquals($agent->user_id, $updated->assigned_to);
        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'assigned_to' => $agent->user_id,
        ]);
    }

    public function test_change_lead_status()
    {
        $lead = Lead::factory()->create(['status' => 'new']);

        $updated = $this->service->changeStatus($lead->id, 'contacted');

        $this->assertEquals('contacted', $updated->status);
        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'status' => 'contacted',
        ]);
    }

    public function test_add_note_to_lead()
    {
        $this->actingAs(User::factory()->create());
        $lead = Lead::factory()->create();

        $note = $this->service->addNote($lead->id, 'Customer interested in penthouse');

        $this->assertDatabaseHas('lead_notes', [
            'lead_id' => $lead->id,
            'note' => 'Customer interested in penthouse',
        ]);
        $this->assertEquals($lead->id, $note->lead_id);
    }

    public function test_export_csv_with_filters()
    {
        Lead::factory(5)->create(['status' => 'new']);
        Lead::factory(3)->create(['status' => 'contacted']);

        $response = $this->service->exportCSV(['status' => 'new']);

        $this->assertInstanceOf(\Symfony\Component\HttpFoundation\StreamedResponse::class, $response);
    }
}
