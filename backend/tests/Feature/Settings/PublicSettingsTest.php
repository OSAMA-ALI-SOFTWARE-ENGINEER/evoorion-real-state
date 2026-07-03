<?php

namespace Tests\Feature\Settings;

use App\Models\Setting;
use Tests\TestCase;

class PublicSettingsTest extends TestCase
{
    public function test_public_settings_expose_google_analytics_id(): void
    {
        Setting::set('google_analytics_id', 'G-TEST123');

        $this->getJson('/api/v1/settings')
            ->assertStatus(200)
            ->assertJsonPath('data.google_analytics_id', 'G-TEST123');
    }
}
