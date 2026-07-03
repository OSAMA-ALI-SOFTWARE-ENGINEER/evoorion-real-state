<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasRole('super_admin');
    }

    public function rules(): array
    {
        return [
            'role'      => 'sometimes|in:user,agent,manager,super_admin',
            'is_active' => 'sometimes|boolean',
            'name'      => 'sometimes|string|max:255',
            'region_id' => 'nullable|exists:regions,id',
        ];
    }
}
