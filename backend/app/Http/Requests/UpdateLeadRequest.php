<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && (auth()->user()->hasRole('manager') || auth()->user()->hasRole('agent'));
    }

    public function rules(): array
    {
        $isManager = auth()->user()?->hasRole('manager') ?? false;

        return [
            'status'      => 'sometimes|in:new,contacted,qualified,closed,lost',
            'assigned_to' => $isManager ? 'sometimes|nullable|exists:users,id' : 'prohibited',
            'message'     => 'sometimes|string|max:1000',
            'note'        => 'sometimes|string|max:2000',
        ];
    }
}
