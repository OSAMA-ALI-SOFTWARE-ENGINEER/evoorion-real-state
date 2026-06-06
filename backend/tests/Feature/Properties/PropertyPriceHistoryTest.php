<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use App\Models\PropertyPriceHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyPriceHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_initial_price_recorded_on_create(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $this->actingAs($manager);

        $property = Property::factory()->create(['price' => 500000, 'currency' => 'AED']);

        $this->assertDatabaseHas('property_price_histories', [
            'property_id' => $property->id,
            'price'       => 500000,
            'currency'    => 'AED',
            'changed_by'  => $manager->id,
        ]);
    }

    public function test_price_change_recorded_on_update(): void
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $this->actingAs($manager);
        $property = Property::factory()->create(['price' => 500000]);

        $property->update(['price' => 600000]);

        $this->assertDatabaseHas('property_price_histories', [
            'property_id' => $property->id,
            'price'       => 600000,
            'changed_by'  => $manager->id,
        ]);
    }

    public function test_non_price_update_does_not_create_history(): void
    {
        $property     = Property::factory()->create(['price' => 500000]);
        $initialCount = PropertyPriceHistory::where('property_id', $property->id)->count();
        $this->assertSame(1, $initialCount);

        $property->update(['title' => 'New Title']);

        $this->assertSame(
            $initialCount,
            PropertyPriceHistory::where('property_id', $property->id)->count()
        );
    }

    public function test_history_ordered_newest_first(): void
    {
        $property = Property::factory()->create(['price' => 100000]);
        $property->update(['price' => 200000]);
        $property->update(['price' => 300000]);

        $prices = $property->fresh()->priceHistory
            ->pluck('price')
            ->map(fn ($p) => (float) $p)
            ->values()
            ->toArray();

        $this->assertSame([300000.0, 200000.0, 100000.0], $prices);
    }

    public function test_changed_by_is_null_when_no_auth(): void
    {
        $property = Property::factory()->create(['price' => 500000]);

        $this->assertDatabaseHas('property_price_histories', [
            'property_id' => $property->id,
            'changed_by'  => null,
        ]);
    }
}
