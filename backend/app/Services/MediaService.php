<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

/**
 * Delegates media uploads to the driver configured in admin Settings.
 * Drivers: local | cloudinary
 * (S3 can be added by installing league/flysystem-aws-s3-v3 and adding an S3StorageService.)
 */
class MediaService
{
    public function __construct(
        protected SettingService    $settings,
        protected CloudinaryService $cloudinary,
        protected LocalStorageService $local,
    ) {}

    private function driver(): string
    {
        return $this->settings->get('storage_driver', 'local');
    }

    public function uploadImage(UploadedFile $file, string $folder = 'properties'): array
    {
        return match ($this->driver()) {
            'cloudinary' => $this->cloudinary->uploadImage($file, $folder),
            default      => $this->local->uploadImage($file, $folder),
        };
    }

    public function uploadDocument(UploadedFile $file, string $folder = 'leads/documents'): array
    {
        return match ($this->driver()) {
            'cloudinary' => $this->cloudinary->uploadDocument($file, $folder),
            default      => $this->local->uploadDocument($file, $folder),
        };
    }

    public function deleteMedia(string $publicId): void
    {
        match ($this->driver()) {
            'cloudinary' => $this->cloudinary->deleteMedia($publicId),
            default      => $this->local->deleteMedia($publicId),
        };
    }
}
