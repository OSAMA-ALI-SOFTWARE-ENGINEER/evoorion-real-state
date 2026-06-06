<?php

namespace Database\Seeders;

use App\Models\OperationType;
use Illuminate\Database\Seeder;

class OperationTypeSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Buy', 'Rent', 'Stay', 'Off-plan'] as $type) {
            OperationType::create(['name' => $type]);
        }
    }
}
