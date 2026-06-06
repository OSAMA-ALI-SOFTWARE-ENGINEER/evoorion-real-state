<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $manager;
    protected Area $area;
    protected Developer $developer;
    protected OperationType $operationType;

    public function setUp(): void
    {
        parent::setUp();
        $this->manager = User::factory()->create(['role' => 'manager']);
        $this->area = Area::factory()->create();
        $this->developer = Developer::factory()->create();
        $this->operationType = OperationType::factory()->create();
    }

    public function test_manager_can_create_property(): void
    {
        $response = $this->actingAs($this->manager)->postJson('/api/v1/admin/properties', [
            'title' => 'New Luxury Villa',
            'type' => 'villa',
            'price' => 5000000,
            'area_id' => $this->area->id,
            'operation_type_id' => $this->operationType->id,
            'developer_id' => $this->developer->id,
            'status' => 'available',
            'amenities' => ['pool', 'gym'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'New Luxury Villa');

        $this->assertDatabaseHas('properties', ['title' => 'New Luxury Villa']);
    }

    public function test_manager_can_update_property(): void
    {
        $property = Property::factory()->create([
            'area_id' => $this->area->id,
            'developer_id' => $this->developer->id,
            'operation_type_id' => $this->operationType->id,
        ]);

        $response = $this->actingAs($this->manager)->putJson(
            "/api/v1/admin/properties/{$property->slug}",
            [
                'title' => 'Updated Title',
                'price' => 6000000,
            ]
        );

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title');

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'title' => 'Updated Title']);
    }

    public function test_manager_can_soft_delete_property(): void
    {
        $property = Property::factory()->create([
            'area_id' => $this->area->id,
            'developer_id' => $this->developer->id,
            'operation_type_id' => $this->operationType->id,
        ]);

        $response = $this->actingAs($this->manager)->deleteJson("/api/v1/admin/properties/{$property->slug}");

        $response->assertStatus(200);
        $this->assertSoftDeleted($property);
    }

    public function test_manager_can_restore_property(): void
    {
        $property = Property::factory()->create([
            'area_id' => $this->area->id,
            'developer_id' => $this->developer->id,
            'operation_type_id' => $this->operationType->id,
        ]);

        $property->delete();
        $this->assertSoftDeleted($property);

        $response = $this->actingAs($this->manager)->postJson("/api/v1/admin/properties/{$property->slug}/restore");

        $response->assertStatus(200);
        $this->assertNotSoftDeleted($property);
    }

    public function test_manager_can_list_all_properties_including_deleted(): void
    {
        Property::factory()->count(3)->create([
            'area_id' => $this->area->id,
            'developer_id' => $this->developer->id,
            'operation_type_id' => $this->operationType->id,
        ]);

        $deleted = Property::factory()->create([
            'area_id' => $this->area->id,
            'developer_id' => $this->developer->id,
            'operation_type_id' => $this->operationType->id,
        ]);
        $deleted->delete();

        $response = $this->actingAs($this->manager)->getJson('/api/v1/admin/properties');

        $response->assertStatus(200)
            ->assertJsonPath('meta.pagination.total', 4);
    }

    public function test_agent_cannot_create_property(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $response = $this->actingAs($agent)->postJson('/api/v1/admin/properties', [
            'title' => 'New Property',
            'type' => 'villa',
            'price' => 5000000,
        ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_create_property(): void
    {
        $response = $this->postJson('/api/v1/admin/properties', [
            'title' => 'New Property',
        ]);

        $response->assertStatus(401);
    }

    public function test_super_admin_can_create_property(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $response = $this->actingAs($superAdmin)->postJson('/api/v1/admin/properties', [
            'title' => 'New Luxury Penthouse',
            'type' => 'penthouse',
            'price' => 10000000,
            'area_id' => $this->area->id,
            'operation_type_id' => $this->operationType->id,
            'developer_id' => $this->developer->id,
            'status' => 'available',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'New Luxury Penthouse');
    }
}
