<?php

namespace Tests\Unit\Models;

use App\Models\Agency;
use App\Models\Agent;
use Tests\TestCase;

class AgencyTest extends TestCase
{
    public function test_agency_can_be_created(): void
    {
        $agency = Agency::create([
            'name' => 'Premium Real Estate Group',
            'contact_email' => 'contact@agency.ae',
            'phone' => '+971501234567',
            'address' => 'Dubai, UAE',
        ]);

        $this->assertDatabaseHas('agencies', ['name' => 'Premium Real Estate Group']);
        $this->assertEquals('contact@agency.ae', $agency->contact_email);
    }

    public function test_agency_can_have_multiple_agents(): void
    {
        $agency = Agency::factory()->create();
        $agents = Agent::factory(3)->create(['agency_id' => $agency->id]);

        $this->assertEquals(3, $agency->agents()->count());
        $this->assertTrue($agency->agents()->pluck('id')->contains($agents[0]->id));
    }

    public function test_agency_name_is_unique(): void
    {
        Agency::create([
            'name' => 'Unique Agency Name',
            'contact_email' => 'contact1@agency.ae',
            'phone' => '+971501234567',
            'address' => 'Dubai, UAE',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        Agency::create([
            'name' => 'Unique Agency Name',
            'contact_email' => 'contact2@agency.ae',
            'phone' => '+971501234568',
            'address' => 'Abu Dhabi, UAE',
        ]);
    }

    public function test_agency_fillable_attributes(): void
    {
        $data = [
            'name' => 'Test Agency',
            'logo_url' => 'https://example.com/logo.png',
            'contact_email' => 'test@agency.ae',
            'phone' => '+971501234567',
            'address' => 'Dubai, UAE',
        ];

        $agency = Agency::create($data);

        $this->assertEquals($data['name'], $agency->name);
        $this->assertEquals($data['logo_url'], $agency->logo_url);
        $this->assertEquals($data['contact_email'], $agency->contact_email);
        $this->assertEquals($data['phone'], $agency->phone);
        $this->assertEquals($data['address'], $agency->address);
    }
}
