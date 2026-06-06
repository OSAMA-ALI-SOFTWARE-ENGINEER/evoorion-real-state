<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['name' => 'Palm Jumeirah', 'description' => 'Iconic palm-shaped island development'],
            ['name' => 'Downtown Dubai', 'description' => 'City center with Burj Khalifa'],
            ['name' => 'Dubai Marina', 'description' => 'Waterfront residential and commercial hub'],
            ['name' => 'Emirates Hills', 'description' => 'Luxury hillside villas'],
            ['name' => 'Al Barari', 'description' => 'Gated community with lush landscaping'],
        ];

        foreach ($areas as $area) {
            Area::create([
                'name' => $area['name'],
                'slug' => Str::slug($area['name']),
                'description' => $area['description'],
            ]);
        }
    }
}
