<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PropertyFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search'             => 'nullable|string|max:255',
            'area_id'            => 'nullable|integer|exists:areas,id',
            'developer_id'       => 'nullable|integer|exists:developers,id',
            'operation_type_id'  => 'nullable|integer|exists:operation_types,id',
            'type'               => 'nullable|in:villa,apartment,penthouse,townhouse,commercial',
            'featured'           => 'nullable|boolean',
            'min_price'          => 'nullable|numeric|min:0',
            'max_price'          => 'nullable|numeric|min:0',
            'bedrooms_min'       => 'nullable|integer|min:0',
            'bedrooms_max'       => 'nullable|integer|min:0',
            'bathrooms_min'      => 'nullable|integer|min:0',
            'bathrooms_max'      => 'nullable|integer|min:0',
            'sort_by'            => 'nullable|in:price,created_at,views_count,area_sqft,bedrooms',
            'sort_direction'     => 'nullable|in:asc,desc',
            'page'               => 'nullable|integer|min:1',
            'per_page'           => 'nullable|integer|min:1|max:100',
        ];
    }
}
