<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class JobListingController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $jobs = JobListing::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'department', 'location', 'type', 'description', 'requirements', 'created_at']);

        return $this->success($jobs);
    }
}
