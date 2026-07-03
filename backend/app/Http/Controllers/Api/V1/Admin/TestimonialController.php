<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Content
 *
 * Admin: manage client testimonials shown on the website. Requires manager or super_admin role.
 */
class TestimonialController extends Controller
{
    use ApiResponse;

    private function validated(Request $request, bool $creating = false): array
    {
        return $request->validate([
            'author_name'  => ($creating ? 'required' : 'sometimes') . '|string|max:255',
            'author_title' => 'sometimes|nullable|string|max:255',
            'quote'        => ($creating ? 'required' : 'sometimes') . '|string|max:1000',
            'rating'       => 'sometimes|nullable|integer|min:1|max:5',
            'avatar_url'   => 'sometimes|nullable|url|max:2048',
            'is_active'    => 'sometimes|boolean',
            'sort_order'   => 'sometimes|integer',
        ]);
    }

    public function index(): JsonResponse
    {
        return $this->success(Testimonial::orderBy('sort_order')->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $testimonial = Testimonial::create($this->validated($request, creating: true));

        return $this->success($testimonial, 'Testimonial created', 201);
    }

    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $testimonial->update($this->validated($request));

        return $this->success($testimonial->fresh(), 'Testimonial updated');
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return $this->success(null, 'Testimonial deleted');
    }
}
