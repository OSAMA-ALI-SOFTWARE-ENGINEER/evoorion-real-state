<?php

namespace Tests\Unit\Models;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    public function test_property_slug_is_auto_generated_from_title(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = Property::create([
            'title' => 'Luxury Villa in Palm Jumeirah',
            'description' => 'A beautiful villa',
            'type' => 'villa',
            'price' => 5000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $this->assertEquals('luxury-villa-in-palm-jumeirah', $property->slug);
    }

    public function test_property_slug_is_unique(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::create([
            'title' => 'Luxury Villa',
            'description' => 'A beautiful villa',
            'type' => 'villa',
            'price' => 5000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $property2 = Property::create([
            'title' => 'Luxury Villa',
            'description' => 'Another beautiful villa',
            'type' => 'villa',
            'price' => 6000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $this->assertEquals('luxury-villa-1', $property2->slug);
    }

    public function test_featured_scope(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(3)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'is_featured' => false,
        ]);

        Property::factory(2)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'is_featured' => true,
        ]);

        $this->assertEquals(2, Property::featured()->count());
    }

    public function test_available_scope(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(2)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'sold',
        ]);

        Property::factory(3)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'available',
        ]);

        $this->assertEquals(3, Property::available()->count());
    }

    public function test_search_scope_searches_title_and_description(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::create([
            'title' => 'Luxury Penthouse',
            'description' => 'Spectacular views',
            'type' => 'penthouse',
            'price' => 10000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $this->assertEquals(1, Property::search('Luxury')->count());
        $this->assertEquals(1, Property::search('Spectacular')->count());
        $this->assertEquals(0, Property::search('NonExistent')->count());
    }
}
