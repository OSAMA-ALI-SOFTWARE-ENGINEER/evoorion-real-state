<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // ── Brand colours ─────────────────────────────────────────────
            ['key' => 'color_brand',         'value' => '#0A0F1E', 'group' => 'theme'],
            ['key' => 'color_brand_section', 'value' => '#0D1526', 'group' => 'theme'],
            ['key' => 'color_gold',          'value' => '#C9A84C', 'group' => 'theme'],
            ['key' => 'color_gold_light',    'value' => '#D4B77A', 'group' => 'theme'],
            ['key' => 'color_muted',         'value' => '#A0ABBB', 'group' => 'theme'],

            // ── Section hero images (empty = CSS gradient fallback) ────────
            ['key' => 'image_hero',      'value' => '', 'group' => 'images'],
            ['key' => 'image_cta',       'value' => '', 'group' => 'images'],
            ['key' => 'image_why_dubai', 'value' => '', 'group' => 'images'],

            // ── Section backgrounds (JSON blobs) ─────────────────────────
            ['key' => 'section_bg_what_we_do',            'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_our_process',           'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_trust_strip',           'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_hero_about',            'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_hero_contact',          'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_hero_investments',      'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_hero_properties',       'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_hero_blog',             'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_hero_locations',        'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_about_difference',      'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_about_cta',             'value' => '{"type":"default"}', 'group' => 'sections'],
            ['key' => 'section_bg_investments_strategies','value' => '{"type":"default"}', 'group' => 'sections'],

            // ── Partners / trust strip ────────────────────────────────────
            ['key' => 'trust_strip_label', 'value' => 'Trusted by Leading Developers', 'group' => 'partners'],
            ['key' => 'trust_strip_speed', 'value' => '25', 'group' => 'partners'],
            [
                'key'   => 'partners_list',
                'value' => json_encode([
                    ['name' => 'EMAAR',        'logo_url' => ''],
                    ['name' => 'DAMAC',        'logo_url' => ''],
                    ['name' => 'SOBHA REALTY', 'logo_url' => ''],
                    ['name' => 'NAKHEEL',      'logo_url' => ''],
                    ['name' => 'MERAAS',       'logo_url' => ''],
                    ['name' => 'SELECT GROUP', 'logo_url' => ''],
                ]),
                'group' => 'partners',
            ],
        ];

        foreach ($defaults as $row) {
            Setting::firstOrCreate(['key' => $row['key']], [
                'value' => $row['value'],
                'group' => $row['group'],
            ]);
        }
    }
}
