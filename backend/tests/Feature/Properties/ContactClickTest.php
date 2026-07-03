<?php

namespace Tests\Feature\Properties;

use App\Models\Agent;
use App\Models\ContactClick;
use App\Models\Property;
use App\Models\User;
use Tests\TestCase;

class ContactClickTest extends TestCase
{
    public function test_records_whatsapp_click_with_assigned_agent(): void
    {
        $property = Property::factory()->create(['is_active' => true]);
        $agent    = Agent::factory()->create();
        $property->agents()->attach($agent->id, ['assigned_at' => now()]);

        $response = $this->postJson("/api/v1/properties/{$property->slug}/contact-clicks", [
            'channel' => 'whatsapp',
        ]);

        $response->assertStatus(201)->assertJsonPath('success', true);
        $this->assertDatabaseHas('contact_clicks', [
            'property_id' => $property->id,
            'agent_id'    => $agent->id,
            'channel'     => 'whatsapp',
        ]);
    }

    public function test_records_email_click_without_agent(): void
    {
        $property = Property::factory()->create(['is_active' => true]);

        $this->postJson("/api/v1/properties/{$property->slug}/contact-clicks", ['channel' => 'email'])
            ->assertStatus(201);

        $this->assertDatabaseHas('contact_clicks', [
            'property_id' => $property->id,
            'agent_id'    => null,
            'channel'     => 'email',
        ]);
    }

    public function test_rejects_invalid_channel(): void
    {
        $property = Property::factory()->create(['is_active' => true]);

        $this->postJson("/api/v1/properties/{$property->slug}/contact-clicks", ['channel' => 'carrier-pigeon'])
            ->assertStatus(422);

        $this->assertSame(0, ContactClick::count());
    }

    public function test_rejects_inactive_property(): void
    {
        $property = Property::factory()->create(['is_active' => false]);

        $this->postJson("/api/v1/properties/{$property->slug}/contact-clicks", ['channel' => 'whatsapp'])
            ->assertStatus(404);
    }

    public function test_contact_clicks_report_aggregates_by_channel_property_and_agent(): void
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $agent    = Agent::factory()->create();

        ContactClick::create(['property_id' => $property->id, 'agent_id' => $agent->id, 'channel' => 'whatsapp']);
        ContactClick::create(['property_id' => $property->id, 'agent_id' => $agent->id, 'channel' => 'whatsapp']);
        ContactClick::create(['property_id' => $property->id, 'agent_id' => $agent->id, 'channel' => 'email']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/reports/contact-clicks');

        $response->assertStatus(200)
            ->assertJsonPath('data.whatsapp_total', 2)
            ->assertJsonPath('data.email_total', 1)
            ->assertJsonPath('data.top_properties.0.property_id', $property->id)
            ->assertJsonPath('data.top_properties.0.total', 3)
            ->assertJsonPath('data.by_agent.0.agent_id', $agent->id)
            ->assertJsonPath('data.by_agent.0.whatsapp_clicks', 2);
    }

    public function test_public_property_show_exposes_assigned_agent_contact(): void
    {
        $property = Property::factory()->create(['is_active' => true]);
        $agent    = Agent::factory()->create(['whatsapp' => '+971501234567']);
        $property->agents()->attach($agent->id, ['assigned_at' => now()]);

        $response = $this->getJson("/api/v1/properties/{$property->slug}");

        $response->assertStatus(200)
            ->assertJsonPath('data.agent.id', $agent->id)
            ->assertJsonPath('data.agent.whatsapp', '+971501234567')
            ->assertJsonPath('data.agent.email', $agent->user->email);
    }

    public function test_public_property_show_hides_agent_with_inactive_user(): void
    {
        $property = Property::factory()->create(['is_active' => true]);
        $agent    = Agent::factory()->create();
        $agent->user->update(['is_active' => false]);
        $property->agents()->attach($agent->id, ['assigned_at' => now()]);

        $this->getJson("/api/v1/properties/{$property->slug}")
            ->assertStatus(200)
            ->assertJsonPath('data.agent', null);
    }

    public function test_region_whatsapp_setting_key_is_accepted(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($admin)
            ->putJson('/api/v1/admin/settings', ['settings' => ['region_ae_whatsapp' => '+971500000001']])
            ->assertStatus(200);

        $this->assertDatabaseHas('settings', ['key' => 'region_ae_whatsapp', 'value' => '+971500000001']);
    }
}
