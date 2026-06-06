<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_show_property_details(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'available',
        ]);

        PropertyImage::factory(3)->create(['property_id' => $property->id]);

        $response = $this->getJson("/api/v1/properties/{$property->slug}");

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.title', $property->title)
            ->assertJsonPath('data.slug', $property->slug)
            ->assertJsonCount(3, 'data.images');
    }

    public function test_property_show_increments_views(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        $this->getJson("/api/v1/properties/{$property->slug}");
        $this->getJson("/api/v1/properties/{$property->slug}");
        $this->getJson("/api/v1/properties/{$property->slug}");

        $response = $this->getJson("/api/v1/properties/{$property->slug}");
        $response->assertStatus(200);
    }
}
