<?php

namespace Tests\Unit\Services;

use App\Services\CloudinaryService;
use Tests\TestCase;

class CloudinaryServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Set valid Cloudinary configuration for testing
        config([
            'services.cloudinary.cloud_name' => 'test_cloud',
            'services.cloudinary.api_key' => 'test_key',
            'services.cloudinary.api_secret' => 'test_secret',
        ]);
    }

    public function test_service_can_be_instantiated(): void
    {
        $service = $this->app->make(CloudinaryService::class);
        $this->assertInstanceOf(CloudinaryService::class, $service);
    }

    public function test_service_has_upload_image_method(): void
    {
        $service = $this->app->make(CloudinaryService::class);
        $this->assertTrue(method_exists($service, 'uploadImage'));
    }

    public function test_service_has_upload_video_method(): void
    {
        $service = $this->app->make(CloudinaryService::class);
        $this->assertTrue(method_exists($service, 'uploadVideo'));
    }

    public function test_service_has_delete_media_method(): void
    {
        $service = $this->app->make(CloudinaryService::class);
        $this->assertTrue(method_exists($service, 'deleteMedia'));
    }
}
