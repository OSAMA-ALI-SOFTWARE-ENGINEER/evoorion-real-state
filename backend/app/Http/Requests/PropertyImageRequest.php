<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PropertyImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['manager', 'super_admin']);
    }

    public function rules(): array
    {
        return [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'is_primary' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return ['image.max' => 'Image size must not exceed 10MB'];
    }
}
