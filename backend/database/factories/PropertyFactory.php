<?php

namespace Database\Factories;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'type' => fake()->randomElement(['villa', 'apartment', 'penthouse', 'townhouse', 'commercial']),
            'price' => fake()->numberBetween(500000, 10000000),
            'currency' => 'AED',
            'area_id' => Area::factory(),
            'location' => fake()->address(),
            'area_sqft' => fake()->numberBetween(1000, 10000),
            'bedrooms' => fake()->numberBetween(1, 5),
            'bathrooms' => fake()->numberBetween(1, 4),
            'operation_type_id' => OperationType::firstOrCreate(
                ['name' => fake()->randomElement(['Buy', 'Rent', 'Stay', 'Off-plan'])]
            )->id,
            'status' => 'available',
            'is_featured' => fake()->boolean(30),
            'roi_min' => fake()->numberBetween(3, 7),
            'roi_max' => fake()->numberBetween(8, 15),
            'developer_id' => Developer::factory(),
            'primary_agent_id' => null,
            'meta_title' => fake()->words(4, true),
            'meta_description' => fake()->sentence(),
            'views_count' => fake()->numberBetween(0, 1000),
        ];
    }
}
