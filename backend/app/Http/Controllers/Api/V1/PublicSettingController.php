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
        // Locale-specific offices
        'contact_phone_de',
        'contact_email_de',
        'contact_address_de',
        'contact_hours_de',
        'contact_phone_gb',
        'contact_email_gb',
        'contact_address_gb',
        'contact_hours_gb',
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
        // Section backgrounds
        'section_bg_what_we_do',
        'section_bg_our_process',
        'section_bg_trust_strip',
        'section_bg_hero_about',
        'section_bg_hero_contact',
        'section_bg_hero_investments',
        'section_bg_hero_properties',
        'section_bg_hero_blog',
        'section_bg_hero_locations',
        'section_bg_about_difference',
        'section_bg_about_cta',
        'section_bg_investments_strategies',
        // Translations per locale
        'translations_en',
        'translations_ar',
        'translations_de',
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
