<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadDocumentRequest;
use App\Models\Lead;
use App\Models\LeadDocument;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;

/**
 * @group Lead Documents
 *
 * File attachments on leads. Agents manage documents on their assigned leads only.
 */
class LeadDocumentController extends Controller
{
    public function __construct(protected CloudinaryService $cloudinaryService) {}

    public function index(Lead $lead): JsonResponse
    {
        $this->authorize('view', $lead);

        $documents = $lead->documents()->with('user')->latest()->get();

        return response()->json(['success' => true, 'data' => $documents]);
    }

    public function store(StoreLeadDocumentRequest $request, Lead $lead): JsonResponse
    {
        $this->authorize('addDocument', $lead);

        if ($lead->documents()->count() >= 20) {
            return response()->json([
                'success' => false,
                'message' => 'Lead has reached the 20 document limit',
            ], 422);
        }

        $file     = $request->file('file');
        $uploaded = $this->cloudinaryService->uploadDocument($file);

        $document = $lead->documents()->create([
            'user_id'   => auth()->id(),
            'name'      => $file->getClientOriginalName(),
            'url'       => $uploaded['url'],
            'public_id' => $uploaded['public_id'],
            'mime_type' => $file->getMimeType(),
            'size'      => $file->getSize(),
        ]);

        return response()->json(['success' => true, 'data' => $document->fresh()->load('user')], 201);
    }

    public function destroy(Lead $lead, LeadDocument $document): JsonResponse
    {
        $this->authorize('deleteDocument', $lead);

        if ($document->lead_id !== $lead->id) {
            return response()->json(['success' => false, 'message' => 'Document not found on this lead'], 404);
        }

        $this->cloudinaryService->deleteMedia($document->public_id);
        $document->delete();

        return response()->json(['success' => true]);
    }
}
