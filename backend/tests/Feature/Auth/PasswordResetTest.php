<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    public function test_forgot_password_returns_success_for_existing_email()
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email]);

        $response->assertStatus(200)->assertJsonPath('success', true);
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);
    }

    public function test_forgot_password_returns_success_even_for_unknown_email()
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nobody@nowhere.com',
        ]);

        // Must not leak whether email exists
        $response->assertStatus(200)->assertJsonPath('success', true);
    }

    public function test_forgot_password_sends_reset_notification()
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_forgot_password_response_does_not_contain_token()
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email]);

        $this->assertArrayNotHasKey('token', $response->json());
    }

    public function test_reset_password_with_valid_token()
    {
        $user = User::factory()->create();
        $plainToken = 'test-plain-token-123';
        $this->insertResetToken($user->email, $plainToken);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => $plainToken,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)->assertJsonPath('success', true);
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_reset_password_with_invalid_token_fails()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => 'wrong-token',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_reset_password_with_expired_token_fails()
    {
        $user = User::factory()->create();

        DB::table('password_reset_tokens')->insert([
            'email'      => $user->email,
            'token'      => Hash::make('expired-token'),
            'created_at' => Carbon::now()->subMinutes(61),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => 'expired-token',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)->assertJsonPath('message', 'Token has expired');
    }

    public function test_reset_password_revokes_all_existing_tokens()
    {
        $user = User::factory()->create();
        $user->createToken('old-token');
        $user->createToken('another-token');
        $this->assertCount(2, $user->tokens);

        $plainToken = 'test-revoke-token';
        $this->insertResetToken($user->email, $plainToken);

        $this->postJson('/api/v1/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => $plainToken,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $this->assertCount(0, $user->fresh()->tokens);
    }

    public function test_reset_token_is_deleted_after_use()
    {
        $user = User::factory()->create();
        $plainToken = 'test-delete-token';
        $this->insertResetToken($user->email, $plainToken);

        $this->postJson('/api/v1/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => $plainToken,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
    }

    private function insertResetToken(string $email, string $plainToken): void
    {
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        DB::table('password_reset_tokens')->insert([
            'email'      => $email,
            'token'      => Hash::make($plainToken),
            'created_at' => Carbon::now(),
        ]);
    }
}
