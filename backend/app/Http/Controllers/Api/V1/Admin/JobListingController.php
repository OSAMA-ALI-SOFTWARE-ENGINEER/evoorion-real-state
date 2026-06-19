<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobListingController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $jobs = JobListing::orderBy('created_at', 'desc')->get();
        return $this->success($jobs);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'department'   => 'required|string|max:100',
            'location'     => 'nullable|string|max:255',
            'type'         => 'required|in:full_time,part_time,contract,internship',
            'description'  => 'required|string',
            'requirements' => 'nullable|string',
            'is_active'    => 'nullable|boolean',
        ]);

        $job = JobListing::create($data);
        return $this->success($job, 'Job listing created.', 201);
    }

    public function update(Request $request, JobListing $jobListing): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'department'   => 'sometimes|required|string|max:100',
            'location'     => 'nullable|string|max:255',
            'type'         => 'sometimes|required|in:full_time,part_time,contract,internship',
            'description'  => 'sometimes|required|string',
            'requirements' => 'nullable|string',
            'is_active'    => 'nullable|boolean',
        ]);

        $jobListing->update($data);
        return $this->success($jobListing, 'Job listing updated.');
    }

    public function destroy(JobListing $jobListing): JsonResponse
    {
        $jobListing->delete();
        return $this->success(null, 'Job listing deleted.');
    }
}
