<?php

namespace Tests\Unit\Models;

use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\User;
use Tests\TestCase;

class LeadNoteTest extends TestCase
{
    public function test_lead_note_can_be_created(): void
    {
        $lead = Lead::factory()->create();
        $user = User::factory()->create();

        $note = LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => $user->id,
            'note' => 'Test note content',
        ]);

        $this->assertDatabaseHas('lead_notes', ['note' => 'Test note content']);
        $this->assertEquals($lead->id, $note->lead_id);
        $this->assertEquals($user->id, $note->user_id);
    }

    public function test_lead_note_belongs_to_lead(): void
    {
        $lead = Lead::factory()->create();
        $user = User::factory()->create();
        $note = LeadNote::factory()->create(['lead_id' => $lead->id, 'user_id' => $user->id]);

        $this->assertTrue($note->lead()->is($lead));
    }

    public function test_lead_note_belongs_to_user(): void
    {
        $lead = Lead::factory()->create();
        $user = User::factory()->create();
        $note = LeadNote::factory()->create(['lead_id' => $lead->id, 'user_id' => $user->id]);

        $this->assertTrue($note->user()->is($user));
    }

    public function test_lead_has_many_notes(): void
    {
        $lead = Lead::factory()->create();
        LeadNote::factory(3)->create(['lead_id' => $lead->id]);

        $this->assertEquals(3, $lead->notes()->count());
    }
}
