<?php

namespace Tests\Unit\Models;

use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Tests\TestCase;

class LeadTest extends TestCase
{
    public function test_lead_can_be_created(): void
    {
        $lead = Lead::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+971501234567',
            'source' => 'website',
            'status' => 'new',
        ]);

        $this->assertDatabaseHas('leads', ['name' => 'John Doe']);
        $this->assertEquals('new', $lead->status);
    }

    public function test_by_status_scope(): void
    {
        Lead::factory(3)->create(['status' => 'new']);
        Lead::factory(2)->create(['status' => 'contacted']);

        $this->assertEquals(3, Lead::byStatus('new')->count());
        $this->assertEquals(2, Lead::byStatus('contacted')->count());
    }

    public function test_search_scope(): void
    {
        Lead::create(['name' => 'John Doe', 'email' => 'john@example.com', 'source' => 'website']);
        Lead::create(['name' => 'Jane Smith', 'email' => 'jane@example.com', 'source' => 'website']);

        $this->assertEquals(1, Lead::search('John')->count());
        $this->assertEquals(1, Lead::search('jane@example.com')->count());
    }

    public function test_unassigned_scope(): void
    {
        $user = User::factory()->create();
        Lead::factory(2)->create(['assigned_to' => $user->id]);
        Lead::factory(3)->create(['assigned_to' => null]);

        $this->assertEquals(3, Lead::unassigned()->count());
    }
}
