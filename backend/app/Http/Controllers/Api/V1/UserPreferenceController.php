<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\UserPreference;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserPreferenceController
{
    use ApiResponse;

    public function show(): JsonResponse
    {
        $prefs = UserPreference::firstOrCreate(
            ['user_id' => auth()->id()],
            ['currency' => 'AED', 'area_unit' => 'SQ.FT']
        );

        return $this->success($prefs);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'currency'  => 'sometimes|string|max:10',
            'area_unit' => 'sometimes|in:SQ.FT,SQ.M',
        ]);

        $prefs = UserPreference::updateOrCreate(
            ['user_id' => auth()->id()],
            $data
        );

        return $this->success($prefs->fresh());
    }
}
