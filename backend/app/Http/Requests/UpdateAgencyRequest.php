<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasRole('manager');
    }

    public function rules(): array
    {
        $agencyId = $this->route('agency')?->id;

        return [
            'name'          => "sometimes|string|max:255|unique:agencies,name,{$agencyId}",
            'logo_url'      => 'sometimes|nullable|url|max:2048',
            'contact_email' => 'sometimes|nullable|email|max:255',
            'phone'         => 'sometimes|nullable|string|max:30',
            'address'       => 'sometimes|nullable|string|max:500',
        ];
    }
}
