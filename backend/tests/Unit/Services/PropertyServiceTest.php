<?php

namespace Tests\Unit\Services;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Services\PropertyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PropertyService $service;
    protected Property $property;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new PropertyService();
        $this->property = Property::factory()->create([
            'area_id' => Area::factory()->create()->id,
            'developer_id' => Developer::factory()->create()->id,
            'operation_type_id' => OperationType::factory()->create()->id,
            'views_count' => 0,
        ]);
    }

    public function test_increment_views(): void
    {
        $this->service->incrementViews($this->property->id);
        $this->service->incrementViews($this->property->id);

        $views = $this->service->getViewCount($this->property->id);
        $this->assertEquals(2, $views);
    }

    public function test_get_view_count_returns_zero_for_nonexistent(): void
    {
        $views = $this->service->getViewCount(999999);
        $this->assertEquals(0, $views);
    }

    public function test_get_view_count_returns_current_value(): void
    {
        $this->property->update(['views_count' => 5]);

        $views = $this->service->getViewCount($this->property->id);
        $this->assertEquals(5, $views);
    }

    public function test_increment_views_multiple_properties(): void
    {
        $other = Property::factory()->create([
            'area_id' => $this->property->area_id,
            'developer_id' => $this->property->developer_id,
            'operation_type_id' => $this->property->operation_type_id,
            'views_count' => 0,
        ]);

        $this->service->incrementViews($this->property->id);
        $this->service->incrementViews($this->property->id);
        $this->service->incrementViews($other->id);

        $this->assertEquals(2, $this->service->getViewCount($this->property->id));
        $this->assertEquals(1, $this->service->getViewCount($other->id));
    }
}
