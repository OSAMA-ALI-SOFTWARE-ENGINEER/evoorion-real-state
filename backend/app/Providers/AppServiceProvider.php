<?php

namespace App\Providers;

use App\Http\Middleware\RoleMiddleware;
use App\Models\Lead;
use App\Models\Property;
use App\Observers\LeadObserver;
use App\Observers\PropertyObserver;
use App\Policies\LeadPolicy;
use App\Services\SettingService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SettingService::class);
    }

    public function boot(): void
    {
        $this->app->make('Illuminate\Routing\Router')->aliasMiddleware(
            'role', RoleMiddleware::class
        );

        Lead::observe(LeadObserver::class);
        Property::observe(PropertyObserver::class);
        Gate::policy(Lead::class, LeadPolicy::class);

        $this->applyDatabaseSettings();
    }

    private function applyDatabaseSettings(): void
    {
        // Guard: DB may not be ready during migrations or early artisan commands
        try {
            $s = app(SettingService::class);

            // Mail / SMTP
            if ($host = $s->get('mail_host')) {
                config(['mail.mailers.smtp.host' => $host]);
            }
            if ($port = $s->get('mail_port')) {
                config(['mail.mailers.smtp.port' => (int) $port]);
            }
            if ($user = $s->get('mail_username')) {
                config(['mail.mailers.smtp.username' => $user]);
            }
            if ($pass = $s->get('mail_password')) {
                config(['mail.mailers.smtp.password' => $pass]);
            }
            if ($enc = $s->get('mail_encryption')) {
                config(['mail.mailers.smtp.encryption' => $enc]);
            }
            if ($from = $s->get('mail_from_address')) {
                config(['mail.from.address' => $from]);
            }
            if ($name = $s->get('mail_from_name')) {
                config(['mail.from.name' => $name]);
            }
        } catch (\Throwable) {
            // Silently skip if settings table doesn't exist yet (fresh install)
        }
    }
}
