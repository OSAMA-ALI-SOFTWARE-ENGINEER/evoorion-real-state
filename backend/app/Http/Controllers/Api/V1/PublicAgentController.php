<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PublicAgentController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $agents = Agent::with(['user', 'agency'])
            ->whereHas('user', fn($q) => $q->where('is_active', true))
            ->get()
            ->map(fn(Agent $a) => [
                'id'         => $a->id,
                'name'       => $a->user->name,
                'email'      => $a->user->email,
                'phone'      => $a->phone,
                'whatsapp'   => $a->whatsapp,
                'avatar_url' => $a->user->avatar_url ?? null,
                'agency'     => $a->agency ? ['id' => $a->agency->id, 'name' => $a->agency->name] : null,
                'listings'   => $a->propertyAssignments()->count(),
            ]);

        return $this->success($agents);
    }
}
