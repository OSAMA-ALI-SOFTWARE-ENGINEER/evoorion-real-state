<?php

namespace Tests\Unit\Models;

use App\Models\Agent;
use App\Models\Agency;
use App\Models\User;
use Tests\TestCase;

class AgentTest extends TestCase
{
    public function test_agent_can_be_created(): void
    {
        $user = User::factory()->create();
        $agency = Agency::factory()->create();

        $agent = Agent::create([
            'user_id' => $user->id,
            'agency_id' => $agency->id,
            'phone' => '+971501234567',
        ]);

        $this->assertDatabaseHas('agents', ['user_id' => $user->id, 'agency_id' => $agency->id]);
        $this->assertEquals('+971501234567', $agent->phone);
    }

    public function test_agent_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $agency = Agency::factory()->create();
        $agent = Agent::factory()->create(['user_id' => $user->id, 'agency_id' => $agency->id]);

        $this->assertInstanceOf(User::class, $agent->user);
        $this->assertEquals($user->id, $agent->user->id);
    }

    public function test_agent_belongs_to_agency(): void
    {
        $agency = Agency::factory()->create();
        $agent = Agent::factory()->create(['agency_id' => $agency->id]);

        $this->assertInstanceOf(Agency::class, $agent->agency);
        $this->assertEquals($agency->id, $agent->agency->id);
    }

    public function test_agent_user_id_is_unique(): void
    {
        $user = User::factory()->create();
        $agency = Agency::factory()->create();

        Agent::create([
            'user_id' => $user->id,
            'agency_id' => $agency->id,
            'phone' => '+971501234567',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        Agent::create([
            'user_id' => $user->id,
            'agency_id' => $agency->id,
            'phone' => '+971501234568',
        ]);
    }

    public function test_agent_soft_deletes(): void
    {
        $agent = Agent::factory()->create();
        $agentId = $agent->id;

        $agent->delete();

        $this->assertNull(Agent::find($agentId));
        $this->assertNotNull(Agent::withTrashed()->find($agentId));
    }

    public function test_agent_fillable_attributes(): void
    {
        $user = User::factory()->create();
        $agency = Agency::factory()->create();

        $data = [
            'user_id' => $user->id,
            'agency_id' => $agency->id,
            'phone' => '+971501234567',
            'whatsapp' => '+971501234568',
        ];

        $agent = Agent::create($data);

        $this->assertEquals($data['user_id'], $agent->user_id);
        $this->assertEquals($data['agency_id'], $agent->agency_id);
        $this->assertEquals($data['phone'], $agent->phone);
        $this->assertEquals($data['whatsapp'], $agent->whatsapp);
    }

    public function test_deleting_agency_deletes_agents(): void
    {
        $agency = Agency::factory()->create();
        $agent = Agent::factory()->create(['agency_id' => $agency->id]);

        $agency->delete();

        $this->assertDatabaseMissing('agents', ['id' => $agent->id]);
    }

    public function test_deleting_user_cascade_deletes_agent(): void
    {
        $user = User::factory()->create();
        $agent = Agent::factory()->create(['user_id' => $user->id]);

        // Force delete the user to test cascade delete
        $user->forceDelete();

        $this->assertDatabaseMissing('agents', ['id' => $agent->id]);
    }
}
