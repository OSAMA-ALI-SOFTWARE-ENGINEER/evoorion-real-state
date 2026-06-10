<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['manager', 'super_admin']);
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:villa,apartment,penthouse,townhouse,commercial',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'area_id' => 'required|integer|exists:areas,id',
            'location' => 'nullable|string',
            'area_sqft' => 'nullable|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'operation_type_id' => 'required|integer|exists:operation_types,id',
            'status' => 'required|in:available,sold,rented',
            'is_featured' => 'nullable|boolean',
            'is_active'   => 'nullable|boolean',
            'roi_min' => 'nullable|numeric|min:0',
            'roi_max' => 'nullable|numeric|min:0',
            'developer_id' => 'required|integer|exists:developers,id',
            'primary_agent_id' => 'nullable|integer|exists:users,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string',
        ];
    }
}
