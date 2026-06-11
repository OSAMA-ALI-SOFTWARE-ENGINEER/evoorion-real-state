<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        // exchange_rate is relative to AED (AED = 1.0 base)
        $currencies = [
            ['code' => 'AED', 'name' => 'UAE Dirham',        'symbol' => 'AED', 'is_default' => true,  'sort_order' => 1,  'exchange_rate' => 1.000000],
            ['code' => 'USD', 'name' => 'US Dollar',         'symbol' => '$',   'is_default' => false, 'sort_order' => 2,  'exchange_rate' => 0.272200],
            ['code' => 'EUR', 'name' => 'Euro',              'symbol' => '€',   'is_default' => false, 'sort_order' => 3,  'exchange_rate' => 0.250300],
            ['code' => 'GBP', 'name' => 'British Pound',     'symbol' => '£',   'is_default' => false, 'sort_order' => 4,  'exchange_rate' => 0.215100],
            ['code' => 'SAR', 'name' => 'Saudi Riyal',       'symbol' => 'SAR', 'is_default' => false, 'sort_order' => 5,  'exchange_rate' => 1.020600],
            ['code' => 'INR', 'name' => 'Indian Rupee',      'symbol' => '₹',   'is_default' => false, 'sort_order' => 6,  'exchange_rate' => 22.73000],
            ['code' => 'RUB', 'name' => 'Russian Ruble',     'symbol' => '₽',   'is_default' => false, 'sort_order' => 7,  'exchange_rate' => 24.95000],
            ['code' => 'CNY', 'name' => 'Chinese Yuan',      'symbol' => '¥',   'is_default' => false, 'sort_order' => 8,  'exchange_rate' => 1.979000],
            ['code' => 'CHF', 'name' => 'Swiss Franc',       'symbol' => 'CHF', 'is_default' => false, 'sort_order' => 9,  'exchange_rate' => 0.245100],
            ['code' => 'CAD', 'name' => 'Canadian Dollar',   'symbol' => 'CA$', 'is_default' => false, 'sort_order' => 10, 'exchange_rate' => 0.372600],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'symbol' => 'A$',  'is_default' => false, 'sort_order' => 11, 'exchange_rate' => 0.416600],
            ['code' => 'QAR', 'name' => 'Qatari Riyal',      'symbol' => 'QAR', 'is_default' => false, 'sort_order' => 12, 'exchange_rate' => 0.992400],
            ['code' => 'KWD', 'name' => 'Kuwaiti Dinar',     'symbol' => 'KWD', 'is_default' => false, 'sort_order' => 13, 'exchange_rate' => 0.083600],
        ];

        foreach ($currencies as $c) {
            $existing = Currency::where('code', $c['code'])->first();
            if ($existing) {
                $existing->update(['exchange_rate' => $c['exchange_rate']]);
            } else {
                Currency::create(array_merge($c, ['is_active' => true]));
            }
        }
    }
}
