<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_user_can_register()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'New User',
            'email'                 => 'newuser@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'data' => ['user', 'token']]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'role'  => 'user',
        ]);
    }

    public function test_registration_requires_unique_email()
    {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'User A',
            'email'                 => 'dupe@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'User B',
            'email'                 => 'dupe@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_registration_requires_password_confirmation()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'User',
            'email'                 => 'user@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    }

    public function test_registered_user_gets_role_user()
    {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Regular User',
            'email'                 => 'regular@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertDatabaseHas('users', ['email' => 'regular@test.com', 'role' => 'user']);
    }

    public function test_registered_user_cannot_access_admin_endpoints()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Public User',
            'email'                 => 'public@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $token = $response->json('data.token');

        $adminResponse = $this->withToken($token)->getJson('/api/v1/admin/leads');

        $adminResponse->assertStatus(403);
    }
}
