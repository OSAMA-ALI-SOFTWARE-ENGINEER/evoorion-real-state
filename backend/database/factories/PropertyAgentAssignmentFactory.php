<?php

namespace Database\Factories;

use App\Models\Agent;
use App\Models\Property;
use App\Models\PropertyAgentAssignment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyAgentAssignmentFactory extends Factory
{
    protected $model = PropertyAgentAssignment::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'agent_id' => Agent::factory(),
            'assigned_at' => now(),
        ];
    }
}
