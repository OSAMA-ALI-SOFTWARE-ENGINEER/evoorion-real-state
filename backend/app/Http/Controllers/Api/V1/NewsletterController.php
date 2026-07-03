<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    use ApiResponse;

    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email|max:255',
            'name'  => 'nullable|string|max:100',
            'company_website' => 'nullable|string|max:255',
        ]);

        // Honeypot: real users never see this field; bots fill it. Pretend success.
        if (!empty($data['company_website'])) {
            return $this->success(null, 'Subscribed successfully.');
        }

        $subscriber = NewsletterSubscriber::firstOrCreate(
            ['email' => $data['email']],
            ['name' => $data['name'] ?? null, 'is_active' => true],
        );

        if (!$subscriber->wasRecentlyCreated && !$subscriber->is_active) {
            $subscriber->update(['is_active' => true]);
        }

        return $this->success(null, 'Subscribed successfully.');
    }
}
