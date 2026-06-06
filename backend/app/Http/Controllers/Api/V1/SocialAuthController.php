<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController
{
    use ApiResponse;

    private const ALLOWED_PROVIDERS = ['google', 'facebook'];

    public function redirect(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::ALLOWED_PROVIDERS), 422, 'Unsupported provider');

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::ALLOWED_PROVIDERS), 422, 'Unsupported provider');

        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $user = User::firstOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'name'            => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'password'        => null,
                    'role'            => 'user',
                    'is_active'       => true,
                    'social_provider' => $provider,
                    'social_id'       => $socialUser->getId(),
                    'avatar_url'      => $socialUser->getAvatar(),
                ]
            );

            // Update social fields if user already existed via email
            if (!$user->wasRecentlyCreated) {
                $user->update([
                    'social_provider' => $provider,
                    'social_id'       => $socialUser->getId(),
                    'avatar_url'      => $user->avatar_url ?? $socialUser->getAvatar(),
                    'last_login_at'   => now(),
                ]);
            }

            if (!$user->is_active) {
                return redirect("{$frontendUrl}/auth/callback?error=account_disabled");
            }

            $token = $user->createToken('social-api-token')->plainTextToken;

            $userData = urlencode(json_encode([
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'avatar_url' => $user->avatar_url,
            ]));

            return redirect("{$frontendUrl}/auth/callback?token={$token}&user={$userData}");
        } catch (\Throwable $e) {
            Log::error("Social auth [{$provider}] failed", ['error' => $e->getMessage()]);

            return redirect("{$frontendUrl}/auth/callback?error=auth_failed");
        }
    }
}
