<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactClick;
use App\Models\Property;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Properties
 *
 * Records a WhatsApp/email contact-button click on a property page so broker
 * enquiries that bypass the lead form still show up in reports.
 */
class ContactClickController extends Controller
{
    use ApiResponse;

    public function store(Request $request, Property $property): JsonResponse
    {
        if (!$property->is_active) {
            abort(404);
        }

        $validated = $request->validate([
            'channel' => 'required|in:whatsapp,email',
        ]);

        ContactClick::create([
            'property_id' => $property->id,
            'agent_id'    => $property->agents()->orderByPivot('assigned_at', 'desc')->value('agents.id'),
            'channel'     => $validated['channel'],
            'ip_address'  => $request->ip(),
        ]);

        return $this->success(null, 'Click recorded', 201);
    }
}
