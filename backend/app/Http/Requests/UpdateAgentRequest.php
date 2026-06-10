<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasRole('manager');
    }

    public function rules(): array
    {
        return [
            'name'       => 'sometimes|string|max:255',
            'agency_id'  => 'sometimes|nullable|exists:agencies,id',
            'phone'      => 'sometimes|nullable|string|max:30',
            'whatsapp'   => 'sometimes|nullable|string|max:30',
            'avatar_url' => 'sometimes|nullable|url|max:2048',
        ];
    }
}
