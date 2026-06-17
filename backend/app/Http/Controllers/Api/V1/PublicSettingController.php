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
        // Theme colours
        'color_brand',
        'color_brand_section',
        'color_gold',
        'color_gold_light',
        'color_muted',
        // Section images
        'image_hero',
        'image_cta',
        'image_why_dubai',
        // Partners strip
        'trust_strip_label',
        'trust_strip_speed',
        'partners_list',
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
