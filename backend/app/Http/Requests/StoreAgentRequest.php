<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasRole('manager');
    }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|max:255|unique:users,email',
            'password'   => 'required|string|min:8|confirmed',
            'agency_id'  => 'sometimes|nullable|exists:agencies,id',
            'phone'      => 'sometimes|nullable|string|max:30',
            'whatsapp'   => 'sometimes|nullable|string|max:30',
            'avatar_url' => 'sometimes|nullable|url|max:2048',
        ];
    }
}
