<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Currency;
use Illuminate\Http\JsonResponse;

class CurrencyController
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Currency::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('code')
                ->get(),
        ]);
    }
}
