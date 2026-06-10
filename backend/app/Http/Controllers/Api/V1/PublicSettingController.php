<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PublicSettingController
{
    use ApiResponse;

    private const PUBLIC_KEYS = [
        'contact_address',
        'contact_phone',
        'contact_email',
        'contact_whatsapp',
        'contact_hours_weekdays',
        'contact_hours_sunday',
        'social_facebook',
        'social_instagram',
        'social_twitter',
        'social_linkedin',
        'social_youtube',
    ];

    public function index(): JsonResponse
    {
        $stored = Setting::whereIn('key', self::PUBLIC_KEYS)
            ->get()
            ->keyBy('key')
            ->map(fn ($s) => $s->value);

        $result = collect(self::PUBLIC_KEYS)
            ->mapWithKeys(fn ($k) => [$k => $stored->get($k)])
            ->toArray();

        return $this->success($result);
    }
}
