<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use Tests\TestCase;

class PropertyComparisonTest extends TestCase
{
    public function test_can_compare_two_properties()
    {
        $p1 = Property::factory()->create(['status' => 'available', 'price' => 500000]);
        $p2 = Property::factory()->create(['status' => 'available', 'price' => 800000]);

        $response = $this->postJson('/api/v1/properties/compare', [
            'slugs' => [$p1->slug, $p2->slug],
        ]);

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.properties')
            ->assertJsonStructure(['data' => ['properties', 'summary' => ['cheapest', 'most_bedrooms', 'largest']]]);
    }

    public function test_can_compare_up_to_four_properties()
    {
        $properties = Property::factory(4)->create(['status' => 'available']);

        $response = $this->postJson('/api/v1/properties/compare', [
            'slugs' => $properties->pluck('slug')->toArray(),
        ]);

        $response->assertStatus(200)->assertJsonCount(4, 'data.properties');
    }

    public function test_comparison_summary_identifies_cheapest()
    {
        $cheap     = Property::factory()->create(['status' => 'available', 'price' => 200000]);
        $expensive = Property::factory()->create(['status' => 'available', 'price' => 900000]);

        $response = $this->postJson('/api/v1/properties/compare', [
            'slugs' => [$cheap->slug, $expensive->slug],
        ]);

        $response->assertStatus(200)->assertJsonPath('data.summary.cheapest', $cheap->slug);
    }

    public function test_comparison_orders_results_by_requested_slug_order()
    {
        $p1 = Property::factory()->create(['status' => 'available']);
        $p2 = Property::factory()->create(['status' => 'available']);
        $p3 = Property::factory()->create(['status' => 'available']);

        $response = $this->postJson('/api/v1/properties/compare', [
            'slugs' => [$p3->slug, $p1->slug, $p2->slug],
        ]);

        $response->assertStatus(200);
        $returnedSlugs = array_column($response->json('data.properties'), 'slug');
        $this->assertEquals([$p3->slug, $p1->slug, $p2->slug], $returnedSlugs);
    }

    public function test_comparison_requires_at_least_two_slugs()
    {
        $p = Property::factory()->create(['status' => 'available']);

        $response = $this->postJson('/api/v1/properties/compare', [
            'slugs' => [$p->slug],
        ]);

        $response->assertStatus(422);
    }

    public function test_comparison_rejects_more_than_four_slugs()
    {
        $properties = Property::factory(5)->create(['status' => 'available']);

        $response = $this->postJson('/api/v1/properties/compare', [
            'slugs' => $properties->pluck('slug')->toArray(),
        ]);

        $response->assertStatus(422);
    }

    public function test_comparison_rejects_nonexistent_slug()
    {
        $p = Property::factory()->create(['status' => 'available']);

        $response = $this->postJson('/api/v1/properties/compare', [
            'slugs' => [$p->slug, 'this-does-not-exist'],
        ]);

        $response->assertStatus(422);
    }
}
