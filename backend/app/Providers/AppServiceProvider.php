<?php

namespace App\Providers;

use App\Http\Middleware\RoleMiddleware;
use App\Models\Lead;
use App\Models\Property;
use App\Observers\LeadObserver;
use App\Observers\PropertyObserver;
use App\Policies\LeadPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->app->make('Illuminate\Routing\Router')->aliasMiddleware(
            'role', RoleMiddleware::class
        );

        Lead::observe(LeadObserver::class);
        Property::observe(PropertyObserver::class);
        Gate::policy(Lead::class, LeadPolicy::class);
    }
}
