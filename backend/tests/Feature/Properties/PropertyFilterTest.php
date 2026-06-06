<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_filter_by_area(): void
    {
        $area1 = Area::factory()->create();
        $area2 = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(3)->create(['area_id' => $area1->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id]);
        Property::factory(2)->create(['area_id' => $area2->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id]);

        $response = $this->getJson("/api/v1/properties?area_id={$area1->id}");
        $response->assertStatus(200)->assertJsonCount(3, 'data');
    }

    public function test_filter_by_type(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(2)->create(['area_id' => $area->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id, 'type' => 'villa']);
        Property::factory(3)->create(['area_id' => $area->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id, 'type' => 'apartment']);

        $response = $this->getJson('/api/v1/properties?type=villa');
        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_filter_by_price_range(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory()->create(['area_id' => $area->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id, 'price' => 1000000]);
        Property::factory()->create(['area_id' => $area->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id, 'price' => 5000000]);
        Property::factory()->create(['area_id' => $area->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id, 'price' => 10000000]);

        $response = $this->getJson('/api/v1/properties?min_price=2000000&max_price=6000000');
        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }

    public function test_search_properties(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory()->create(['area_id' => $area->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id, 'title' => 'Luxury Penthouse']);
        Property::factory(2)->create(['area_id' => $area->id, 'developer_id' => $developer->id, 'operation_type_id' => $operationType->id, 'title' => 'Standard Apartment']);

        $response = $this->getJson('/api/v1/properties?search=Penthouse');
        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }
}
