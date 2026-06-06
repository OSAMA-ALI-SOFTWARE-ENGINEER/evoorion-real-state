<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasRole('manager');
    }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:255|unique:agencies,name',
            'logo_url'      => 'sometimes|nullable|url|max:2048',
            'contact_email' => 'sometimes|nullable|email|max:255',
            'phone'         => 'sometimes|nullable|string|max:30',
            'address'       => 'sometimes|nullable|string|max:500',
        ];
    }
}
