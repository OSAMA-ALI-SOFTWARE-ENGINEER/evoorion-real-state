<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    protected ?Cloudinary $client = null;

    public function __construct(protected SettingService $settings) {}

    protected function sdk(): Cloudinary
    {
        if ($this->client === null) {
            $this->client = new Cloudinary([
                'cloud' => [
                    'cloud_name' => $this->settings->get('cloudinary_cloud_name', config('services.cloudinary.cloud_name')),
                    'api_key'    => $this->settings->get('cloudinary_api_key',    config('services.cloudinary.api_key')),
                    'api_secret' => $this->settings->get('cloudinary_api_secret', config('services.cloudinary.api_secret')),
                ],
            ]);
        }

        return $this->client;
    }

    public function uploadImage(UploadedFile $file, string $folder = 'properties'): array
    {
        $result = $this->sdk()->uploadApi()->upload($file->getRealPath(), [
            'folder'        => $folder,
            'resource_type' => 'auto',
            // Cap huge camera originals and let Cloudinary pick optimal quality/format
            'transformation' => [
                'width'   => 2560,
                'height'  => 2560,
                'crop'    => 'limit',
                'quality' => 'auto:good',
                'fetch_format' => 'auto',
            ],
        ]);

        return ['url' => $result['secure_url'], 'public_id' => $result['public_id']];
    }

    public function uploadVideo(UploadedFile $file, string $folder = 'videos'): array
    {
        $result = $this->sdk()->uploadApi()->upload($file->getRealPath(), [
            'folder'        => $folder,
            'resource_type' => 'video',
        ]);

        return ['url' => $result['secure_url'], 'public_id' => $result['public_id']];
    }

    public function uploadDocument(UploadedFile $file, string $folder = 'leads/documents'): array
    {
        $result = $this->sdk()->uploadApi()->upload($file->getRealPath(), [
            'folder'        => $folder,
            'resource_type' => 'auto',
        ]);

        return ['url' => $result['secure_url'], 'public_id' => $result['public_id']];
    }

    public function deleteMedia(string $publicId): void
    {
        $this->sdk()->uploadApi()->destroy($publicId);
    }
}
