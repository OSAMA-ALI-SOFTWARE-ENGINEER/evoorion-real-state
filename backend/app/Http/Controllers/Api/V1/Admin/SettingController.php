<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Setting;
use App\Services\SettingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController
{
    use ApiResponse;

    public function __construct(protected SettingService $settingService) {}

    private const ALLOWED_KEYS = [
        // Contact
        'contact_whatsapp',
        'contact_email',
        'contact_phone',
        'contact_address',
        // Social media
        'social_facebook',
        'social_instagram',
        'social_twitter',
        'social_linkedin',
        'social_youtube',
        // Storage / media uploads
        'storage_driver',           // local | cloudinary
        'cloudinary_cloud_name',
        'cloudinary_api_key',
        'cloudinary_api_secret',
        // Social OAuth
        'google_client_id',
        'google_client_secret',
        'facebook_client_id',
        'facebook_client_secret',
        // Email / SMTP
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_from_address',
        'mail_from_name',
        // Integrations
        'google_maps_key',
        'google_analytics_id',
        'meta_pixel_id',
    ];

    public function index(): JsonResponse
    {
        $stored = Setting::all()->keyBy('key')->map(fn ($s) => $s->value);

        $result = collect(self::ALLOWED_KEYS)
            ->mapWithKeys(fn ($k) => [$k => $stored->get($k)])
            ->toArray();

        return $this->success($result);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings'   => 'required|array',
            'settings.*' => 'nullable|string|max:1000',
        ]);

        foreach ($data['settings'] as $key => $value) {
            if (!in_array($key, self::ALLOWED_KEYS, true)) {
                continue;
            }
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => $this->groupFor($key)]
            );
        }

        $this->settingService->flush();

        return $this->index();
    }

    private function groupFor(string $key): string
    {
        return match (true) {
            str_starts_with($key, 'contact_')    => 'contact',
            str_starts_with($key, 'social_')     => 'social',
            str_starts_with($key, 'cloudinary_') => 'storage',
            $key === 'storage_driver'             => 'storage',
            str_starts_with($key, 'google_client_')   => 'oauth',
            str_starts_with($key, 'facebook_client_') => 'oauth',
            str_starts_with($key, 'mail_')        => 'email',
            default                               => 'integrations',
        };
    }
}
