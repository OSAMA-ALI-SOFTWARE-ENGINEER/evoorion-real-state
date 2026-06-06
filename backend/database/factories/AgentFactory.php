<?php

namespace Database\Factories;

use App\Models\Agent;
use App\Models\Agency;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Agent>
 */
class AgentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'agent']),
            'agency_id' => Agency::factory(),
            'phone' => fake()->phoneNumber(),
            'whatsapp' => fake()->optional()->phoneNumber(),
        ];
    }
}
