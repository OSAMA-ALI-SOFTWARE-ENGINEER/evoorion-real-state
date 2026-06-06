<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAmenityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasRole('manager');
    }

    public function rules(): array
    {
        return [
            'amenity' => 'required|string|max:255',
        ];
    }
}
