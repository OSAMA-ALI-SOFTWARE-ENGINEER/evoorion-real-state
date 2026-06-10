<?php

namespace Database\Seeders;

use App\Models\Agency;
use Illuminate\Database\Seeder;

class AgencySeeder extends Seeder
{
    public function run(): void
    {
        $agencies = [
            [
                'name'          => 'Haus & Haus',
                'logo_url'      => null,
                'contact_email' => 'info@hausandhaus.com',
                'phone'         => '+971 4 333 0400',
                'address'       => 'Bay Square Building 10, Business Bay, Dubai',
            ],
            [
                'name'          => 'Betterhomes',
                'logo_url'      => null,
                'contact_email' => 'info@bhomes.com',
                'phone'         => '+971 4 409 6911',
                'address'       => 'Marina Plaza, Dubai Marina, Dubai',
            ],
            [
                'name'          => 'Allsopp & Allsopp',
                'logo_url'      => null,
                'contact_email' => 'info@allsoppandallsopp.com',
                'phone'         => '+971 4 220 8500',
                'address'       => 'Jumeirah Business Centre 2, JLT, Dubai',
            ],
            [
                'name'          => 'Provident Estate',
                'logo_url'      => null,
                'contact_email' => 'info@providentestate.com',
                'phone'         => '+971 4 423 7088',
                'address'       => 'The Bay Gate, Business Bay, Dubai',
            ],
            [
                'name'          => 'Engel & Völkers Dubai',
                'logo_url'      => null,
                'contact_email' => 'dubai@engelvoelkers.com',
                'phone'         => '+971 4 338 3822',
                'address'       => 'Emaar Square, Downtown Dubai',
            ],
        ];

        foreach ($agencies as $data) {
            Agency::firstOrCreate(['name' => $data['name']], $data);
        }
    }
}
