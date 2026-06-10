<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            ['code' => 'en',    'name' => 'English',            'native_name' => 'English',          'direction' => 'ltr', 'is_default' => true,  'sort_order' => 1],
            ['code' => 'ar',    'name' => 'Arabic',             'native_name' => 'العربية',           'direction' => 'rtl', 'is_default' => false, 'sort_order' => 2],
            ['code' => 'ru',    'name' => 'Russian',            'native_name' => 'Русский',           'direction' => 'ltr', 'is_default' => false, 'sort_order' => 3],
            ['code' => 'zh-CN', 'name' => 'Chinese (Simplified)', 'native_name' => '中文（简体）',    'direction' => 'ltr', 'is_default' => false, 'sort_order' => 4],
            ['code' => 'fr',    'name' => 'French',             'native_name' => 'Français',          'direction' => 'ltr', 'is_default' => false, 'sort_order' => 5],
            ['code' => 'de',    'name' => 'German',             'native_name' => 'Deutsch',           'direction' => 'ltr', 'is_default' => false, 'sort_order' => 6],
            ['code' => 'hi',    'name' => 'Hindi',              'native_name' => 'हिन्दी',           'direction' => 'ltr', 'is_default' => false, 'sort_order' => 7],
            ['code' => 'ur',    'name' => 'Urdu',               'native_name' => 'اردو',              'direction' => 'rtl', 'is_default' => false, 'sort_order' => 8],
            ['code' => 'tr',    'name' => 'Turkish',            'native_name' => 'Türkçe',            'direction' => 'ltr', 'is_default' => false, 'sort_order' => 9],
        ];

        foreach ($languages as $l) {
            Language::firstOrCreate(['code' => $l['code']], array_merge($l, ['is_active' => true]));
        }
    }
}
