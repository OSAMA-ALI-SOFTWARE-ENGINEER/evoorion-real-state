<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Uploader;

class CloudinaryService
{
    protected ?Cloudinary $cloudinary = null;

    protected function client(): Cloudinary
    {
        if ($this->cloudinary === null) {
            $this->cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('services.cloudinary.cloud_name'),
                    'api_key' => config('services.cloudinary.api_key'),
                    'api_secret' => config('services.cloudinary.api_secret'),
                ],
            ]);
        }

        return $this->cloudinary;
    }

    public function uploadImage($file, $folder = 'properties')
    {
        $this->client();

        $result = Uploader::upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => 'auto',
        ]);

        return [
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    public function uploadVideo($file, $folder = 'videos')
    {
        $this->client();

        $result = Uploader::upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => 'video',
        ]);

        return [
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    public function uploadDocument($file, $folder = 'leads/documents'): array
    {
        $this->client();

        $result = Uploader::upload($file->getRealPath(), [
            'folder'        => $folder,
            'resource_type' => 'auto',
        ]);

        return [
            'url'       => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    public function deleteMedia($publicId): void
    {
        $this->client();
        Uploader::destroy($publicId);
    }
}
