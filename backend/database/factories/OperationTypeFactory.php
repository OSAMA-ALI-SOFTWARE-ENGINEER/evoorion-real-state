<?php

namespace Database\Factories;

use App\Models\OperationType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OperationType>
 */
class OperationTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Buy', 'Rent', 'Stay', 'Off-plan']),
        ];
    }
}
