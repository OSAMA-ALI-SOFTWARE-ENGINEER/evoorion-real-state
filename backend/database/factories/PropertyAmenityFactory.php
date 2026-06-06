<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\PropertyAmenity;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyAmenityFactory extends Factory
{
    protected $model = PropertyAmenity::class;

    public function definition(): array
    {
        $amenities = ['pool', 'gym', 'parking', 'garden', 'security', 'elevator', 'balcony', 'kitchen'];

        return [
            'property_id' => Property::factory(),
            'amenity' => $this->faker->randomElement($amenities),
        ];
    }
}
