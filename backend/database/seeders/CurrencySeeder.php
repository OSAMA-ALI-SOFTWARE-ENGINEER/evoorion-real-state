<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            ['code' => 'AED', 'name' => 'UAE Dirham',          'symbol' => 'AED', 'is_default' => true,  'sort_order' => 1],
            ['code' => 'USD', 'name' => 'US Dollar',           'symbol' => '$',   'is_default' => false, 'sort_order' => 2],
            ['code' => 'EUR', 'name' => 'Euro',                'symbol' => '€',   'is_default' => false, 'sort_order' => 3],
            ['code' => 'GBP', 'name' => 'British Pound',       'symbol' => '£',   'is_default' => false, 'sort_order' => 4],
            ['code' => 'SAR', 'name' => 'Saudi Riyal',         'symbol' => 'SAR', 'is_default' => false, 'sort_order' => 5],
            ['code' => 'INR', 'name' => 'Indian Rupee',        'symbol' => '₹',   'is_default' => false, 'sort_order' => 6],
            ['code' => 'RUB', 'name' => 'Russian Ruble',       'symbol' => '₽',   'is_default' => false, 'sort_order' => 7],
            ['code' => 'CNY', 'name' => 'Chinese Yuan',        'symbol' => '¥',   'is_default' => false, 'sort_order' => 8],
            ['code' => 'CHF', 'name' => 'Swiss Franc',         'symbol' => 'CHF', 'is_default' => false, 'sort_order' => 9],
            ['code' => 'CAD', 'name' => 'Canadian Dollar',     'symbol' => 'CA$', 'is_default' => false, 'sort_order' => 10],
            ['code' => 'AUD', 'name' => 'Australian Dollar',   'symbol' => 'A$',  'is_default' => false, 'sort_order' => 11],
            ['code' => 'QAR', 'name' => 'Qatari Riyal',        'symbol' => 'QAR', 'is_default' => false, 'sort_order' => 12],
            ['code' => 'KWD', 'name' => 'Kuwaiti Dinar',       'symbol' => 'KWD', 'is_default' => false, 'sort_order' => 13],
        ];

        foreach ($currencies as $c) {
            Currency::firstOrCreate(['code' => $c['code']], array_merge($c, ['is_active' => true]));
        }
    }
}
