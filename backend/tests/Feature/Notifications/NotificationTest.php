<?php

namespace Tests\Feature\Notifications;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\LeadAssigned;
use App\Notifications\LeadStatusChanged;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    public function test_agent_receives_notification_when_lead_assigned()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        $lead    = Lead::factory()->create(['assigned_to' => null]);

        $this->actingAs($manager)
            ->putJson("/api/v1/admin/leads/{$lead->id}", ['assigned_to' => $agent->user_id]);

        $this->assertCount(1, $agent->user->fresh()->notifications);
        $notification = $agent->user->notifications->first();
        $this->assertEquals('lead_assigned', $notification->data['type']);
        $this->assertEquals($lead->id, $notification->data['lead_id']);
    }

    public function test_agent_receives_notification_on_status_change()
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        $lead    = Lead::factory()->create(['status' => 'new', 'assigned_to' => $agent->user_id]);

        $this->actingAs($manager)
            ->putJson("/api/v1/admin/leads/{$lead->id}", ['status' => 'contacted']);

        $statusNotification = $agent->user->fresh()->notifications
            ->where('data.type', 'lead_status_changed')
            ->first();

        $this->assertNotNull($statusNotification);
        $this->assertEquals('new', $statusNotification->data['old_status']);
        $this->assertEquals('contacted', $statusNotification->data['new_status']);
    }

    public function test_agent_can_list_own_notifications()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $agent->user->notify(new LeadAssigned($lead));
        $agent->user->notify(new LeadAssigned($lead));

        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data', 'meta' => ['unread_count']]);
        $this->assertGreaterThanOrEqual(2, $response->json('meta.total'));
    }

    public function test_unread_count_returns_correct_number()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $agent->user->notify(new LeadAssigned($lead));
        $agent->user->notify(new LeadAssigned($lead));
        $agent->user->notify(new LeadAssigned($lead));

        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/notifications/unread-count');

        $response->assertStatus(200)->assertJsonPath('data.count', 3);
    }

    public function test_agent_can_mark_notification_as_read()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $agent->user->notify(new LeadAssigned($lead));

        $notificationId = $agent->user->unreadNotifications->first()->id;

        $response = $this->actingAs($agent->user)
            ->postJson("/api/v1/admin/notifications/{$notificationId}/read");

        $response->assertStatus(200);
        $this->assertEquals(0, $agent->user->fresh()->unreadNotifications()->count());
    }

    public function test_agent_can_mark_all_notifications_as_read()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $agent->user->notify(new LeadAssigned($lead));
        $agent->user->notify(new LeadAssigned($lead));

        $response = $this->actingAs($agent->user)
            ->postJson('/api/v1/admin/notifications/read-all');

        $response->assertStatus(200);
        $this->assertEquals(0, $agent->user->fresh()->unreadNotifications()->count());
    }

    public function test_unread_filter_returns_only_unread()
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        $agent->user->notify(new LeadAssigned($lead));
        $agent->user->notify(new LeadAssigned($lead));
        $agent->user->notifications->first()->markAsRead();

        $response = $this->actingAs($agent->user)
            ->getJson('/api/v1/admin/notifications?unread=true');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_lead_assigned_sends_email_to_agent()
    {
        Notification::fake();

        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        $lead    = Lead::factory()->create(['assigned_to' => null]);

        $this->actingAs($manager)
            ->putJson("/api/v1/admin/leads/{$lead->id}", ['assigned_to' => $agent->user_id]);

        Notification::assertSentTo($agent->user, LeadAssigned::class);
    }

    public function test_lead_status_changed_sends_email_to_agent()
    {
        Notification::fake();

        $manager = User::factory()->create(['role' => 'manager']);
        $agent   = Agent::factory()->create();
        $lead    = Lead::factory()->create(['status' => 'new', 'assigned_to' => $agent->user_id]);

        $this->actingAs($manager)
            ->putJson("/api/v1/admin/leads/{$lead->id}", ['status' => 'contacted']);

        Notification::assertSentTo($agent->user, LeadStatusChanged::class);
    }
}
