<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Currency;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success(Currency::orderBy('sort_order')->orderBy('code')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'       => 'required|string|size:3|unique:currencies|uppercase',
            'name'       => 'required|string|max:100',
            'symbol'     => 'required|string|max:10',
            'is_active'  => 'boolean',
            'is_default' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if (!empty($data['is_default'])) {
            Currency::where('is_default', true)->update(['is_default' => false]);
        }

        $currency = Currency::create($data);
        return $this->success($currency, 'Currency created', 201);
    }

    public function update(Request $request, Currency $currency): JsonResponse
    {
        $data = $request->validate([
            'code'       => "sometimes|string|size:3|unique:currencies,code,{$currency->id}",
            'name'       => 'sometimes|string|max:100',
            'symbol'     => 'sometimes|string|max:10',
            'is_active'  => 'boolean',
            'is_default' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if (!empty($data['is_default'])) {
            Currency::where('is_default', true)->where('id', '!=', $currency->id)->update(['is_default' => false]);
        }

        $currency->update($data);
        return $this->success($currency->fresh());
    }

    public function destroy(Currency $currency): JsonResponse
    {
        $currency->delete();
        return $this->success(null, 'Currency deleted');
    }
}
