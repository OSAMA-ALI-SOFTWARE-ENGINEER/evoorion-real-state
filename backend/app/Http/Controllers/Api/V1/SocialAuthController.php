<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\SocialExchangeCode;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\SettingService;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class SocialAuthController
{
    use ApiResponse;

    private const ALLOWED_PROVIDERS = ['google', 'facebook'];

    public function redirect(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::ALLOWED_PROVIDERS), 422, 'Unsupported provider');

        $this->applyOAuthConfig($provider);

        /** @var AbstractProvider $driver */
        $driver = Socialite::driver($provider);

        return $driver->stateless()->redirect();
    }

    /**
     * OAuth callback — issues a 30-second single-use exchange code.
     * The actual bearer token is NEVER placed in the URL; the frontend
     * must POST the exchange code to /auth/social/exchange to receive it.
     */
    public function callback(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::ALLOWED_PROVIDERS), 422, 'Unsupported provider');

        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        try {
            $this->applyOAuthConfig($provider);

            /** @var AbstractProvider $driver */
            $driver     = Socialite::driver($provider);
            $socialUser = $driver->stateless()->user();

            // ── 1. Verify the social provider confirmed this email ──────────
            if ($provider === 'google') {
                $emailVerified = $socialUser->user['email_verified'] ?? false;
                if (!$emailVerified) {
                    return redirect("{$frontendUrl}/auth/callback?error=email_not_verified");
                }
            }
            // Facebook does not reliably expose email_verified; we enforce
            // below by refusing to auto-link to an existing password account.

            $email = $socialUser->getEmail();

            if (!$email) {
                return redirect("{$frontendUrl}/auth/callback?error=no_email");
            }

            // ── 2. Guard against account-takeover via email matching ────────
            // withTrashed() so soft-deleted users are found and restored rather
            // than hitting a unique-key violation on INSERT.
            $existing = User::withTrashed()->where('email', $email)->first();

            if ($existing) {
                // User registered with email + password and has NOT linked this provider before.
                // Guard applies even to soft-deleted accounts — prevents account takeover via
                // social login against a deleted password account.
                $alreadyLinked = $existing->social_provider === $provider;

                if (!$alreadyLinked && $existing->password !== null) {
                    return redirect("{$frontendUrl}/auth/callback?error=email_exists");
                }

                // Only pure social accounts (password === null) or already-linked accounts
                // reach here. Restore if soft-deleted.
                if ($existing->trashed()) {
                    $existing->restore();
                }

                // Safe to update: account was already linked or is a pure social account
                if (!$existing->is_active) {
                    return redirect("{$frontendUrl}/auth/callback?error=account_disabled");
                }

                $existing->update([
                    'social_provider' => $provider,
                    'social_id'       => $socialUser->getId(),
                    'avatar_url'      => $existing->avatar_url ?? $socialUser->getAvatar(),
                    'last_login_at'   => now(),
                ]);

                $user = $existing;
            } else {
                // Brand-new account created via social login
                $user = User::create([
                    'name'            => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'email'           => $email,
                    'password'        => null,
                    'role'            => 'user',
                    'is_active'       => true,
                    'social_provider' => $provider,
                    'social_id'       => $socialUser->getId(),
                    'avatar_url'      => $socialUser->getAvatar(),
                    'last_login_at'   => now(),
                ]);
            }

            // ── 3. Issue a 30-second single-use exchange code (not the token) ──
            $plainToken = $user->createToken('social-api-token')->plainTextToken;
            $code       = SocialExchangeCode::issue($plainToken);

            // Only the short-lived exchange code goes in the URL — never the token.
            return redirect("{$frontendUrl}/auth/callback?code={$code}")
                ->header('Referrer-Policy', 'no-referrer');
        } catch (\Throwable $e) {
            Log::error("Social auth [{$provider}] failed", ['error' => $e->getMessage()]);

            return redirect("{$frontendUrl}/auth/callback?error=auth_failed");
        }
    }

    /**
     * Exchange a single-use code (received from the OAuth callback redirect)
     * for the actual Sanctum bearer token. Code expires in 30 seconds
     * and is deleted immediately on first use (one-time only).
     */
    public function exchange(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|size:64']);

        $record = SocialExchangeCode::where('code', $request->code)
            ->where('expires_at', '>', now())
            ->first();

        if (!$record) {
            return $this->error('Invalid or expired code', null, 422);
        }

        $token = $record->token;

        // Delete immediately — truly one-time use
        $record->delete();

        return $this->success(['token' => $token], 'Token exchanged');
    }

    private function applyOAuthConfig(string $provider): void
    {
        $settings  = app(SettingService::class);
        $clientId  = $settings->get("{$provider}_client_id");
        $clientSecret = $settings->get("{$provider}_client_secret");

        if ($clientId && $clientSecret) {
            config([
                "services.{$provider}.client_id"     => $clientId,
                "services.{$provider}.client_secret" => $clientSecret,
            ]);
        }
    }
}
