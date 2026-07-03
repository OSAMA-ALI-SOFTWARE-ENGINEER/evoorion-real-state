<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                                    => 'required|string|max:255',
            'email'                                   => 'required|email',
            'phone'                                   => 'nullable|string|max:20',
            'whatsapp'                                => 'nullable|string|max:20',
            'property_id'                             => 'nullable|exists:properties,id',
            'budget_min'                              => 'nullable|numeric|min:0',
            'budget_max'                              => 'nullable|numeric|min:0',
            'message'                                 => 'nullable|string|max:1000',
            'source'                                  => 'required|in:website,instagram,facebook,whatsapp,referral,other',
            'type'                                    => 'nullable|in:enquiry,requirement',
            'requirement_data'                        => 'nullable|array',
            'requirement_data.location_preferences'   => 'nullable|array',
            'requirement_data.location_preferences.*' => 'string|max:100',
            'requirement_data.property_types'         => 'nullable|array',
            'requirement_data.property_types.*'       => 'string|max:50',
            'requirement_data.bedrooms'               => 'nullable|array',
            'requirement_data.bedrooms.*'             => 'string|max:10',
            'company_website'                         => 'nullable|string|max:255',
        ];
    }
}
