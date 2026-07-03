<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PublicTestimonialController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $items = Testimonial::where('is_active', true)
            ->orderBy('sort_order')->orderBy('id')
            ->get(['id', 'author_name', 'author_title', 'quote', 'rating', 'avatar_url']);

        return $this->success($items);
    }
}
