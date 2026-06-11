<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\MediaFile;
use App\Services\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController
{
    use ApiResponse;

    public function __construct(protected MediaService $media) {}

    public function index(Request $request): JsonResponse
    {
        $query = MediaFile::with('uploader:id,name')
            ->when($request->folder, fn ($q) => $q->where('folder', $request->folder))
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest();

        $files = $query->paginate($request->integer('per_page', 40));

        return $this->paginated(
            $files->items(),
            $files->total(),
            $files->perPage(),
            $files->currentPage()
        );
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file'   => 'required|file|mimes:jpeg,jpg,png,webp,gif,svg,pdf|max:10240',
            'folder' => 'nullable|string|max:100',
        ]);

        $file   = $request->file('file');
        $folder = $request->input('folder', 'misc');

        $uploaded = $this->media->uploadImage($file, $folder);

        $record = MediaFile::create([
            'name'        => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'url'         => $uploaded['url'],
            'public_id'   => $uploaded['public_id'],
            'mime_type'   => $file->getMimeType(),
            'folder'      => $folder,
            'size'        => $file->getSize(),
            'uploaded_by' => auth()->id(),
        ]);

        return $this->success($record, 'File uploaded', 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $file = MediaFile::findOrFail($id);

        try {
            $this->media->deleteMedia($file->public_id);
        } catch (\Throwable) {
            // file may not exist in storage — continue with DB delete
        }

        $file->delete();

        return $this->success(null, 'File deleted');
    }
}
