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

            // Mail / SMTP — if a host is configured in settings, override env and switch driver to smtp
            if ($host = $s->get('mail_host')) {
                config([
                    'mail.default'                  => 'smtp',
                    'mail.mailers.smtp.host'        => $host,
                    'mail.mailers.smtp.port'        => (int) ($s->get('mail_port') ?? 587),
                    'mail.mailers.smtp.username'    => $s->get('mail_username') ?? '',
                    'mail.mailers.smtp.password'    => $s->get('mail_password') ?? '',
                    'mail.mailers.smtp.encryption'  => $s->get('mail_encryption') ?? 'tls',
                ]);
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
