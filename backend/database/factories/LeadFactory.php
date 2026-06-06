<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'whatsapp' => fake()->optional()->phoneNumber(),
            'budget_min' => fake()->numberBetween(100000, 500000),
            'budget_max' => fake()->numberBetween(500000, 2000000),
            'message' => fake()->optional()->paragraph(),
            'source' => fake()->randomElement(['website', 'instagram', 'facebook', 'whatsapp', 'referral', 'other']),
            'status' => 'new',
        ];
    }
}
