<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Language;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LanguageController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success(Language::orderBy('sort_order')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:10|unique:languages',
            'name'        => 'required|string|max:100',
            'native_name' => 'required|string|max:100',
            'direction'   => 'in:ltr,rtl',
            'is_active'   => 'boolean',
            'is_default'  => 'boolean',
            'sort_order'  => 'integer|min:0',
        ]);

        if (!empty($data['is_default'])) {
            Language::where('is_default', true)->update(['is_default' => false]);
        }

        $lang = Language::create($data);
        return $this->success($lang, 'Language created', 201);
    }

    public function update(Request $request, Language $language): JsonResponse
    {
        $data = $request->validate([
            'code'        => "sometimes|string|max:10|unique:languages,code,{$language->id}",
            'name'        => 'sometimes|string|max:100',
            'native_name' => 'sometimes|string|max:100',
            'direction'   => 'in:ltr,rtl',
            'is_active'   => 'boolean',
            'is_default'  => 'boolean',
            'sort_order'  => 'integer|min:0',
        ]);

        if (!empty($data['is_default'])) {
            Language::where('is_default', true)->where('id', '!=', $language->id)->update(['is_default' => false]);
        }

        $language->update($data);
        return $this->success($language->fresh());
    }

    public function destroy(Language $language): JsonResponse
    {
        $language->delete();
        return $this->success(null, 'Language deleted');
    }
}
