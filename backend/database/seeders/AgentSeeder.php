<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Agent;
use App\Models\User;
use Illuminate\Database\Seeder;

class AgentSeeder extends Seeder
{
    public function run(): void
    {
        $agency = Agency::first();

        if (! $agency) {
            $this->command->warn('No agencies found. Run AgencySeeder first.');
            return;
        }

        $agents = [
            [
                'name'      => 'Sarah Mitchell',
                'email'     => 'sarah.mitchell@evoorion.com',
                'phone'     => '+971 50 123 4567',
                'whatsapp'  => '+971 50 123 4567',
                'agency_id' => Agency::where('name', 'Haus & Haus')->value('id') ?? $agency->id,
            ],
            [
                'name'      => 'James O\'Brien',
                'email'     => 'james.obrien@evoorion.com',
                'phone'     => '+971 55 234 5678',
                'whatsapp'  => '+971 55 234 5678',
                'agency_id' => Agency::where('name', 'Haus & Haus')->value('id') ?? $agency->id,
            ],
            [
                'name'      => 'Priya Sharma',
                'email'     => 'priya.sharma@evoorion.com',
                'phone'     => '+971 52 345 6789',
                'whatsapp'  => '+971 52 345 6789',
                'agency_id' => Agency::where('name', 'Betterhomes')->value('id') ?? $agency->id,
            ],
            [
                'name'      => 'Mohammed Al Farsi',
                'email'     => 'mfarsi@evoorion.com',
                'phone'     => '+971 56 456 7890',
                'whatsapp'  => null,
                'agency_id' => Agency::where('name', 'Allsopp & Allsopp')->value('id') ?? $agency->id,
            ],
            [
                'name'      => 'Anna Kowalski',
                'email'     => 'anna.kowalski@evoorion.com',
                'phone'     => '+971 54 567 8901',
                'whatsapp'  => '+971 54 567 8901',
                'agency_id' => Agency::where('name', 'Provident Estate')->value('id') ?? $agency->id,
            ],
        ];

        foreach ($agents as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'      => $data['name'],
                    'password'  => bcrypt('password123'),
                    'role'      => 'agent',
                    'is_active' => true,
                ]
            );

            Agent::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'agency_id' => $data['agency_id'],
                    'phone'     => $data['phone'],
                    'whatsapp'  => $data['whatsapp'],
                ]
            );
        }
    }
}
