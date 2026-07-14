<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyListTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_available_properties(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(5)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'available',
        ]);

        Property::factory(2)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'sold',
        ]);

        $response = $this->getJson('/api/v1/properties');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonCount(5, 'data');
    }

    public function test_properties_are_paginated(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(30)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        $response = $this->getJson('/api/v1/properties?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.pagination.total', 30)
            ->assertJsonPath('meta.pagination.per_page', 10);
    }

    public function test_properties_per_page_maximum_limit(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(5)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        // 1000 should be valid and return successfully
        $response = $this->getJson('/api/v1/properties?per_page=1000');
        $response->assertStatus(200);

        // 1001 should fail validation
        $responseErr = $this->getJson('/api/v1/properties?per_page=1001');
        $responseErr->assertStatus(422);
    }
}
