<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;

class NewsletterControllerTest extends TestCase
{
    public function test_public_subscribe_newsletter()
    {
        $response = $this->postJson('/api/v1/newsletter/subscribe', [
            'email' => 'subscriber@example.com',
        ]);

        $response->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseHas('newsletter_subscribers', ['email' => 'subscriber@example.com']);
    }

    public function test_newsletter_with_filled_honeypot_is_silently_discarded(): void
    {
        $this->postJson('/api/v1/newsletter/subscribe', [
            'email' => 'bot@spam.com',
            'company_website' => 'https://spam.example',
        ])->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseMissing('newsletter_subscribers', ['email' => 'bot@spam.com']);
    }
}
