<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LocalStorageService
{
    public function uploadImage(UploadedFile $file, string $folder = 'properties'): array
    {
        $filename  = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $storedAt  = $file->storeAs("public/{$folder}", $filename);
        // public_id = path relative to storage/app/public (used for deletion)
        $publicId  = str_replace('public/', '', $storedAt);
        $url       = url("storage/{$publicId}");

        return ['url' => $url, 'public_id' => $publicId];
    }

    public function uploadDocument(UploadedFile $file, string $folder = 'leads/documents'): array
    {
        return $this->uploadImage($file, $folder);
    }

    public function deleteMedia(string $publicId): void
    {
        Storage::delete("public/{$publicId}");
    }
}
