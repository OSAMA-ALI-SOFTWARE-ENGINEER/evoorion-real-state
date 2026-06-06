<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PropertyImageTest extends TestCase
{
    use RefreshDatabase;

    protected User $manager;
    protected Property $property;

    public function setUp(): void
    {
        parent::setUp();
        $this->manager = User::factory()->create(['role' => 'manager']);
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();
        $this->property = Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);
        Storage::fake('local');

        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldReceive('uploadImage')->andReturn([
                'url' => 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg',
                'public_id' => 'properties/test',
            ]);
            $mock->shouldReceive('deleteMedia');
        });
    }

    public function test_manager_can_upload_image(): void
    {
        $file = UploadedFile::fake()->image('property.jpg', 1920, 1080);
        $response = $this->actingAs($this->manager)->postJson("/api/v1/admin/properties/{$this->property->slug}/images", [
            'image' => $file,
        ]);

        $response->assertStatus(201)->assertJsonPath('data.is_primary', false);
    }

    public function test_manager_can_set_primary_image(): void
    {
        $file = UploadedFile::fake()->image('property.jpg');
        $response = $this->actingAs($this->manager)->postJson("/api/v1/admin/properties/{$this->property->slug}/images", [
            'image' => $file,
            'is_primary' => true,
        ]);

        $response->assertStatus(201)->assertJsonPath('data.is_primary', true);
    }

    public function test_agent_cannot_upload_image(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);
        $file = UploadedFile::fake()->image('property.jpg');
        $response = $this->actingAs($agent)->postJson("/api/v1/admin/properties/{$this->property->slug}/images", [
            'image' => $file,
        ]);

        $response->assertStatus(403);
    }

    public function test_image_validation_fails_for_non_image(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 1024);
        $response = $this->actingAs($this->manager)->postJson("/api/v1/admin/properties/{$this->property->slug}/images", [
            'image' => $file,
        ]);

        $response->assertStatus(422);
    }
}
