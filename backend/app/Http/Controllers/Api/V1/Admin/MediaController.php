<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Services\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController
{
    use ApiResponse;

    public function __construct(protected MediaService $media) {}

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file'   => 'required|file|mimes:jpeg,jpg,png,webp,gif,svg|max:5120',
            'folder' => 'nullable|string|max:100',
        ]);

        $folder   = $request->input('folder', 'misc');
        $uploaded = $this->media->uploadImage($request->file('file'), $folder);

        return $this->success(['url' => $uploaded['url'], 'public_id' => $uploaded['public_id']], 'File uploaded', 201);
    }
}
