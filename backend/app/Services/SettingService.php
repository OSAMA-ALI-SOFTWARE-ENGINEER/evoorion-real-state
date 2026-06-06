<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    private const CACHE_KEY = 'app_settings_v1';
    private const TTL       = 3600;

    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL, function () {
            return Setting::all()->pluck('value', 'key')->toArray();
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
