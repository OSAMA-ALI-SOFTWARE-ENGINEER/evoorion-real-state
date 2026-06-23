<?php

namespace Database\Seeders;

use App\Models\Developer;
use Illuminate\Database\Seeder;

class DeveloperSeeder extends Seeder
{
    public function run(): void
    {
        $developers = [
            ['name' => 'Emaar', 'description' => 'Leading Dubai real estate developer'],
            ['name' => 'Damac', 'description' => 'Luxury developer known for premium properties'],
            ['name' => 'Azizi', 'description' => 'Mid-range and affordable developments'],
            ['name' => 'Meraas', 'description' => 'Integrated community developer'],
        ];

        foreach ($developers as $dev) {
            Developer::firstOrCreate(['name' => $dev['name']], $dev);
        }
    }
}
