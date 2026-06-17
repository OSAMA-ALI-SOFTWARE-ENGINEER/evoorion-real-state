<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CurrencySeeder::class,
            LanguageSeeder::class,
            AreaSeeder::class,
            DeveloperSeeder::class,
            OperationTypeSeeder::class,
            UserSeeder::class,
            AgencySeeder::class,
            AgentSeeder::class,
            PropertySeeder::class,
            BlogSeeder::class,
            PageContentSeeder::class,
            SiteSettingsSeeder::class,
        ]);
    }
}
