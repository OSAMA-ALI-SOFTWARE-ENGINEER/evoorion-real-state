<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@evoorion.com'], [
            'name' => 'Admin User',
            'password' => bcrypt('password123'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'manager@evoorion.com'], [
            'name' => 'Manager User',
            'password' => bcrypt('password123'),
            'role' => 'manager',
            'is_active' => true,
        ]);
    }
}
