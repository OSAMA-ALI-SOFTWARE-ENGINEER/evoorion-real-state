<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LocalStorageService
{
    private const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    private const ALLOWED_DOC_EXTENSIONS  = ['pdf', 'doc', 'docx'];

    public function uploadImage(UploadedFile $file, string $folder = 'properties'): array
    {
        // Derive extension from file content (magic bytes), never from client headers
        $ext = strtolower($file->guessExtension() ?? '');

        if (!in_array($ext, self::ALLOWED_IMAGE_EXTENSIONS, true)) {
            throw new \InvalidArgumentException("File type '{$ext}' is not allowed. Upload JPEG, PNG, WebP, or GIF.");
        }

        $filename  = Str::uuid() . '.' . $ext;
        $storedAt  = $file->storeAs("public/{$folder}", $filename);
        // public_id = path relative to storage/app/public (used for deletion)
        $publicId  = str_replace('public/', '', $storedAt);
        $url       = url("storage/{$publicId}");

        return ['url' => $url, 'public_id' => $publicId];
    }

    public function uploadDocument(UploadedFile $file, string $folder = 'leads/documents'): array
    {
        $ext = strtolower($file->guessExtension() ?? '');
        $allowed = array_merge(self::ALLOWED_IMAGE_EXTENSIONS, self::ALLOWED_DOC_EXTENSIONS);

        if (!in_array($ext, $allowed, true)) {
            throw new \InvalidArgumentException("File type '{$ext}' is not allowed.");
        }

        $filename = Str::uuid() . '.' . $ext;
        $storedAt = $file->storeAs("public/{$folder}", $filename);
        $publicId = str_replace('public/', '', $storedAt);
        $url      = url("storage/{$publicId}");

        return ['url' => $url, 'public_id' => $publicId];
    }

    public function deleteMedia(string $publicId): void
    {
        Storage::delete("public/{$publicId}");
    }
}
