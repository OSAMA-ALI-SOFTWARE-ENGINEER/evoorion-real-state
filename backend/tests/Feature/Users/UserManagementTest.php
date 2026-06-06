<?php

namespace Tests\Feature\Users;

use App\Models\Agent;
use App\Models\User;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    public function test_super_admin_can_list_users()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        User::factory(3)->create(['role' => 'agent']);

        $response = $this->actingAs($superAdmin)->getJson('/api/v1/admin/users');

        $response->assertStatus(200)->assertJsonStructure(['success', 'data', 'meta']);
        $this->assertGreaterThanOrEqual(4, $response->json('meta.total'));
    }

    public function test_users_filterable_by_role()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        User::factory(2)->create(['role' => 'agent']);
        User::factory(1)->create(['role' => 'manager']);

        $response = $this->actingAs($superAdmin)->getJson('/api/v1/admin/users?role=agent');

        $response->assertStatus(200);
        foreach ($response->json('data') as $user) {
            $this->assertEquals('agent', $user['role']);
        }
    }

    public function test_users_searchable_by_name_and_email()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        User::factory()->create(['name' => 'Unique Search Name', 'email' => 'unique@search.test']);

        $response = $this->actingAs($superAdmin)->getJson('/api/v1/admin/users?search=Unique+Search');

        $response->assertStatus(200);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_super_admin_can_view_single_user()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $target     = User::factory()->create();

        $response = $this->actingAs($superAdmin)->getJson("/api/v1/admin/users/{$target->id}");

        $response->assertStatus(200)->assertJsonPath('data.id', $target->id);
    }

    public function test_super_admin_can_change_user_role()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $user       = User::factory()->create(['role' => 'agent']);

        $response = $this->actingAs($superAdmin)
            ->putJson("/api/v1/admin/users/{$user->id}", ['role' => 'manager']);

        $response->assertStatus(200);
        $this->assertEquals('manager', $user->fresh()->role);
    }

    public function test_super_admin_can_deactivate_user()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $user       = User::factory()->create(['is_active' => true]);

        $response = $this->actingAs($superAdmin)
            ->putJson("/api/v1/admin/users/{$user->id}", ['is_active' => false]);

        $response->assertStatus(200);
        $this->assertFalse((bool) $user->fresh()->is_active);
    }

    public function test_super_admin_can_soft_delete_user()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $user       = User::factory()->create();

        $response = $this->actingAs($superAdmin)->deleteJson("/api/v1/admin/users/{$user->id}");

        $response->assertStatus(200);
        $this->assertTrue($user->fresh()->trashed());
    }

    public function test_super_admin_can_restore_user()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $user       = User::factory()->create();
        $user->delete();

        $response = $this->actingAs($superAdmin)->postJson("/api/v1/admin/users/{$user->id}/restore");

        $response->assertStatus(200);
        $this->assertFalse($user->fresh()->trashed());
    }

    public function test_super_admin_cannot_delete_own_account()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $response = $this->actingAs($superAdmin)->deleteJson("/api/v1/admin/users/{$superAdmin->id}");

        $response->assertStatus(422)->assertJsonPath('message', 'You cannot deactivate your own account');
    }

    public function test_manager_cannot_access_user_management()
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $response = $this->actingAs($manager)->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }

    public function test_agent_cannot_access_user_management()
    {
        $agent = Agent::factory()->create();

        $response = $this->actingAs($agent->user)->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }

    public function test_deleted_users_appear_in_list()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $user       = User::factory()->create();
        $user->delete();

        $response = $this->actingAs($superAdmin)->getJson('/api/v1/admin/users');

        $ids = array_column($response->json('data'), 'id');
        $this->assertContains($user->id, $ids);
    }
}
