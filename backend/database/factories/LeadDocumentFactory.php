<?php

namespace Database\Factories;

use App\Models\Lead;
use App\Models\LeadDocument;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeadDocument>
 */
class LeadDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'lead_id'   => Lead::factory(),
            'user_id'   => User::factory(),
            'name'      => fake()->word() . '.pdf',
            'url'       => 'https://res.cloudinary.com/demo/leads/documents/' . fake()->uuid(),
            'public_id' => 'leads/documents/' . fake()->uuid(),
            'mime_type' => 'application/pdf',
            'size'      => fake()->numberBetween(10000, 5000000),
        ];
    }
}
