<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\Property;
use Tests\TestCase;

class PropertySearchTest extends TestCase
{
    public function test_filter_by_bedrooms_min()
    {
        Property::factory()->create(['bedrooms' => 2, 'status' => 'available']);
        Property::factory()->create(['bedrooms' => 4, 'status' => 'available']);

        $response = $this->getJson('/api/v1/properties?bedrooms_min=3');

        $response->assertStatus(200);
        foreach ($response->json('data') as $p) {
            $this->assertGreaterThanOrEqual(3, $p['bedrooms']);
        }
    }

    public function test_filter_by_bedrooms_max()
    {
        Property::factory()->create(['bedrooms' => 2, 'status' => 'available']);
        Property::factory()->create(['bedrooms' => 5, 'status' => 'available']);

        $response = $this->getJson('/api/v1/properties?bedrooms_max=3');

        $response->assertStatus(200);
        foreach ($response->json('data') as $p) {
            $this->assertLessThanOrEqual(3, $p['bedrooms']);
        }
    }

    public function test_filter_by_bathrooms_min()
    {
        Property::factory()->create(['bathrooms' => 1, 'status' => 'available']);
        Property::factory()->create(['bathrooms' => 3, 'status' => 'available']);

        $response = $this->getJson('/api/v1/properties?bathrooms_min=2');

        $response->assertStatus(200);
        foreach ($response->json('data') as $p) {
            $this->assertGreaterThanOrEqual(2, $p['bathrooms']);
        }
    }

    public function test_filter_by_developer()
    {
        $dev1 = Developer::factory()->create();
        $dev2 = Developer::factory()->create();
        Property::factory()->create(['developer_id' => $dev1->id, 'status' => 'available']);
        Property::factory()->create(['developer_id' => $dev2->id, 'status' => 'available']);

        $response = $this->getJson("/api/v1/properties?developer_id={$dev1->id}");

        $response->assertStatus(200);
        foreach ($response->json('data') as $p) {
            $this->assertEquals($dev1->id, $p['developer_id']);
        }
    }

    public function test_sort_by_price_asc()
    {
        Property::factory()->create(['price' => 500000, 'status' => 'available']);
        Property::factory()->create(['price' => 200000, 'status' => 'available']);
        Property::factory()->create(['price' => 800000, 'status' => 'available']);

        $response = $this->getJson('/api/v1/properties?sort_by=price&sort_direction=asc');

        $response->assertStatus(200);
        $prices = array_column($response->json('data'), 'price');
        $this->assertEquals($prices, collect($prices)->sort()->values()->toArray());
    }

    public function test_sort_by_price_desc()
    {
        Property::factory()->create(['price' => 300000, 'status' => 'available']);
        Property::factory()->create(['price' => 700000, 'status' => 'available']);

        $response = $this->getJson('/api/v1/properties?sort_by=price&sort_direction=desc');

        $response->assertStatus(200);
        $prices = array_column($response->json('data'), 'price');
        $this->assertEquals($prices, collect($prices)->sortDesc()->values()->toArray());
    }

    public function test_invalid_sort_field_returns_422()
    {
        $response = $this->getJson('/api/v1/properties?sort_by=invalid_field');

        $response->assertStatus(422);
    }
}
