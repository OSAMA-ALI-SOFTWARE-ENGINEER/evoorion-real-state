<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'action'     => $this->faker->randomElement(['created', 'updated', 'deleted', 'restored', 'assigned', 'note_added']),
            'model_type' => $this->faker->randomElement(['Lead', 'Property', 'Agent']),
            'model_id'   => $this->faker->numberBetween(1, 100),
            'changes'    => null,
            'ip_address' => $this->faker->ipv4(),
        ];
    }
}
