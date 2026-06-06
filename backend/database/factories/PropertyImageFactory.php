<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyImageFactory extends Factory
{
    protected $model = PropertyImage::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'url' => $this->faker->imageUrl(),
            'public_id' => 'properties/' . $this->faker->slug(),
            'is_primary' => false,
            'order' => 0,
        ];
    }

    public function primary(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'is_primary' => true,
            ];
        });
    }
}
