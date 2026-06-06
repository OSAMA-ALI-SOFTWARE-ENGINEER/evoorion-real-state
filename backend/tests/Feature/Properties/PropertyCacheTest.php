<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use App\Models\User;
use App\Services\PropertyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PropertyCacheTest extends TestCase
{
    use RefreshDatabase;

    private function warmCache(): void
    {
        $this->getJson('/api/v1/properties')->assertOk();
    }

    private function queryCountOnListing(): int
    {
        DB::enableQueryLog();
        $this->getJson('/api/v1/properties')->assertOk();
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();
        DB::flushQueryLog();

        return $count;
    }

    public function test_delete_invalidates_listing_cache(): void
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $this->warmCache();

        $this->actingAs($manager)
            ->deleteJson("/api/v1/admin/properties/{$property->slug}")
            ->assertOk();

        $this->assertGreaterThan(0, $this->queryCountOnListing());
    }

    public function test_restore_invalidates_listing_cache(): void
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $property->delete();
        $this->warmCache();

        $this->actingAs($manager)
            ->postJson("/api/v1/admin/properties/{$property->slug}/restore")
            ->assertOk();

        $this->assertGreaterThan(0, $this->queryCountOnListing());
    }

    public function test_listing_is_served_from_cache_on_second_call(): void
    {
        Property::factory()->count(3)->create();
        $this->warmCache();

        $this->assertSame(0, $this->queryCountOnListing());
    }

    public function test_create_invalidates_listing_cache(): void
    {
        $this->warmCache();
        app(PropertyService::class)->createProperty(
            Property::factory()->make()->toArray()
        );

        $this->assertGreaterThan(0, $this->queryCountOnListing());
    }

    public function test_update_invalidates_listing_cache(): void
    {
        $property = Property::factory()->create();
        $this->warmCache();
        app(PropertyService::class)->updateProperty($property, ['title' => 'New Title']);

        $this->assertGreaterThan(0, $this->queryCountOnListing());
    }
}
