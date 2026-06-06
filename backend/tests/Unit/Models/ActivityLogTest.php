<?php

namespace Tests\Unit\Models;

use App\Models\ActivityLog;
use App\Models\User;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    public function test_activity_log_can_be_created()
    {
        $user = User::factory()->create();
        $log = ActivityLog::factory()->create(['user_id' => $user->id]);

        $this->assertDatabaseHas('activity_logs', ['id' => $log->id]);
    }

    public function test_activity_log_belongs_to_user()
    {
        $user = User::factory()->create();
        $log = ActivityLog::factory()->create(['user_id' => $user->id]);

        $this->assertEquals($user->id, $log->user->id);
    }

    public function test_activity_log_user_defaults_when_no_user()
    {
        $log = ActivityLog::factory()->create(['user_id' => null]);

        $this->assertEquals('System', $log->user->name);
    }

    public function test_static_log_method_creates_record()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $log = ActivityLog::log('created', 'Lead', 42, $user->id, ['after' => ['name' => 'Test']]);

        $this->assertDatabaseHas('activity_logs', [
            'action'     => 'created',
            'model_type' => 'Lead',
            'model_id'   => 42,
            'user_id'    => $user->id,
        ]);
        $this->assertEquals('created', $log->action);
        $this->assertEquals(['after' => ['name' => 'Test']], $log->changes);
    }

    public function test_changes_are_cast_to_array()
    {
        $log = ActivityLog::factory()->create([
            'changes' => ['before' => ['status' => 'new'], 'after' => ['status' => 'contacted']],
        ]);

        $this->assertIsArray($log->changes);
        $this->assertEquals('new', $log->changes['before']['status']);
    }

    public function test_static_log_uses_authenticated_user()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $log = ActivityLog::log('deleted', 'Lead', 1);

        $this->assertEquals($user->id, $log->user_id);
    }
}
