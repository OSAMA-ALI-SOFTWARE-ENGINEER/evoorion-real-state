<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasRole('manager');
    }

    public function rules(): array
    {
        return [
            'ids'         => 'required|array|min:1|max:100',
            'ids.*'       => 'required|integer|exists:leads,id',
            'status'      => 'sometimes|in:new,contacted,qualified,closed,lost',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
        ];
    }
}
