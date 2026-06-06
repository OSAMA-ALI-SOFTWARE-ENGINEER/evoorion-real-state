<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController
{
    use ApiResponse;

    private const ALLOWED_KEYS = [
        // Contact
        'contact_whatsapp',
        'contact_email',
        'contact_phone',
        'contact_address',
        // Social
        'social_facebook',
        'social_instagram',
        'social_twitter',
        'social_linkedin',
        'social_youtube',
        // Integrations
        'google_maps_key',
        'google_analytics_id',
        'meta_pixel_id',
    ];

    public function index(): JsonResponse
    {
        $settings = Setting::all()->keyBy('key')->map(fn ($s) => $s->value);

        // Fill missing keys with null so the frontend gets a complete object
        $result = collect(self::ALLOWED_KEYS)
            ->mapWithKeys(fn ($k) => [$k => $settings->get($k)])
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

        return $this->index();
    }

    private function groupFor(string $key): string
    {
        return match (true) {
            str_starts_with($key, 'contact_')     => 'contact',
            str_starts_with($key, 'social_')      => 'social',
            default                                => 'integrations',
        };
    }
}
