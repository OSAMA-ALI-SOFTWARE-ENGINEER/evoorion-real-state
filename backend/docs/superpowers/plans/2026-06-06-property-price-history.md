# Property Price History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record every property price change (including initial creation) in an append-only `property_price_histories` table, tracking the price, currency, and the user who made the change.

**Architecture:** A `PropertyObserver` hooks into Laravel model events — `created` (initial price) and `updating` (price changes only, detected via `isDirty`) — and inserts a row into `property_price_histories`. No controller or service changes are needed.

**Tech Stack:** Laravel 12, PHP 8.2, SQLite (tests). Observer pattern follows the existing `LeadObserver`. PHP binary: `D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe`.

---

## File Map

| File | Change |
|---|---|
| `database/migrations/2026_06_06_000002_create_property_price_histories_table.php` | New — creates the append-only history table |
| `app/Models/PropertyPriceHistory.php` | New — append-only model with `property()` and `changedBy()` relationships |
| `app/Models/Property.php` | Add `priceHistory(): HasMany` |
| `app/Observers/PropertyObserver.php` | New — hooks `created` and `updating` events |
| `app/Providers/AppServiceProvider.php` | Register `PropertyObserver` |
| `tests/Feature/Properties/PropertyPriceHistoryTest.php` | New — 5 tests |

Test command: `& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test`

---

## Task 1: Migration, model, and Property relationship

### Files:
- Create: `database/migrations/2026_06_06_000002_create_property_price_histories_table.php`
- Create: `app/Models/PropertyPriceHistory.php`
- Modify: `app/Models/Property.php`
- Create: `tests/Feature/Properties/PropertyPriceHistoryTest.php`

- [ ] **Step 1: Create the test file with all 5 tests — they will all fail**

Create `tests/Feature/Properties/PropertyPriceHistoryTest.php`:

```php
<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use App\Models\PropertyPriceHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyPriceHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_initial_price_recorded_on_create(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $this->actingAs($manager);

        $property = Property::factory()->create(['price' => 500000, 'currency' => 'AED']);

        $this->assertDatabaseHas('property_price_histories', [
            'property_id' => $property->id,
            'price'       => 500000,
            'currency'    => 'AED',
            'changed_by'  => $manager->id,
        ]);
    }

    public function test_price_change_recorded_on_update(): void
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create(['price' => 500000]);
        $this->actingAs($manager);

        $property->update(['price' => 600000]);

        $this->assertDatabaseHas('property_price_histories', [
            'property_id' => $property->id,
            'price'       => 600000,
            'changed_by'  => $manager->id,
        ]);
    }

    public function test_non_price_update_does_not_create_history(): void
    {
        $property     = Property::factory()->create(['price' => 500000]);
        $initialCount = PropertyPriceHistory::where('property_id', $property->id)->count();

        $property->update(['title' => 'New Title']);

        $this->assertSame(
            $initialCount,
            PropertyPriceHistory::where('property_id', $property->id)->count()
        );
    }

    public function test_history_ordered_newest_first(): void
    {
        $property = Property::factory()->create(['price' => 100000]);
        $property->update(['price' => 200000]);
        $property->update(['price' => 300000]);

        $prices = $property->priceHistory
            ->pluck('price')
            ->map(fn ($p) => (float) $p)
            ->values()
            ->toArray();

        $this->assertSame([300000.0, 200000.0, 100000.0], $prices);
    }

    public function test_changed_by_is_null_when_no_auth(): void
    {
        $property = Property::factory()->create(['price' => 500000]);

        $this->assertDatabaseHas('property_price_histories', [
            'property_id' => $property->id,
            'changed_by'  => null,
        ]);
    }
}
```

- [ ] **Step 2: Run the tests — expect all 5 to fail**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter PropertyPriceHistoryTest
```

Expected: 5 failures — table `property_price_histories` does not exist.

- [ ] **Step 3: Create the migration**

Create `database/migrations/2026_06_06_000002_create_property_price_histories_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('property_price_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 15, 2);
            $table->string('currency', 10);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at');

            $table->index('property_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_price_histories');
    }
};
```

- [ ] **Step 4: Create the `PropertyPriceHistory` model**

Create `app/Models/PropertyPriceHistory.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyPriceHistory extends Model
{
    public $timestamps = false;

    const CREATED_AT = 'created_at';

    protected $fillable = [
        'property_id',
        'price',
        'currency',
        'changed_by',
    ];

    protected $casts = [
        'price'      => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
```

- [ ] **Step 5: Add `priceHistory()` relationship to `Property`**

Open `app/Models/Property.php`. Add this import at the top with the other `HasMany` imports — no new `use` statement needed, `HasMany` is already imported.

Add this method after the `amenities()` relationship (around line 77):

```php
public function priceHistory(): HasMany
{
    return $this->hasMany(PropertyPriceHistory::class)->orderByDesc('id');
}
```

- [ ] **Step 6: Run the tests — still failing (no observer yet), but different errors**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter PropertyPriceHistoryTest
```

Expected: tests that assert history rows exist still fail (observer not registered yet), but `test_non_price_update_does_not_create_history` may pass vacuously since no rows are created at all.

- [ ] **Step 7: Commit the data layer**

```
git add database/migrations/2026_06_06_000002_create_property_price_histories_table.php
git add app/Models/PropertyPriceHistory.php
git add app/Models/Property.php
git add tests/Feature/Properties/PropertyPriceHistoryTest.php
git commit -m "feat: add property_price_histories migration, model, and relationship"
```

---

## Task 2: Observer and registration

### Files:
- Create: `app/Observers/PropertyObserver.php`
- Modify: `app/Providers/AppServiceProvider.php`

- [ ] **Step 1: Create the observer**

Create `app/Observers/PropertyObserver.php`:

```php
<?php

namespace App\Observers;

use App\Models\Property;
use App\Models\PropertyPriceHistory;

class PropertyObserver
{
    public function created(Property $property): void
    {
        PropertyPriceHistory::create([
            'property_id' => $property->id,
            'price'       => $property->price,
            'currency'    => $property->currency,
            'changed_by'  => auth()->id(),
        ]);
    }

    public function updating(Property $property): void
    {
        if (!$property->isDirty('price')) {
            return;
        }

        PropertyPriceHistory::create([
            'property_id' => $property->id,
            'price'       => $property->price,
            'currency'    => $property->currency,
            'changed_by'  => auth()->id(),
        ]);
    }
}
```

- [ ] **Step 2: Register the observer in `AppServiceProvider`**

Open `app/Providers/AppServiceProvider.php`. The current file looks like:

```php
<?php

namespace App\Providers;

use App\Http\Middleware\RoleMiddleware;
use App\Models\Lead;
use App\Observers\LeadObserver;
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
        Gate::policy(Lead::class, LeadPolicy::class);
    }
}
```

Replace it entirely with:

```php
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
```

- [ ] **Step 3: Run all 5 price history tests — expect all PASS**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter PropertyPriceHistoryTest
```

Expected: 5 tests, 5 passed.

- [ ] **Step 4: Run the full suite — expect all passing**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test
```

Expected: 238 tests passing (233 existing + 5 new), 0 failures.

Note: all existing `Property::factory()->create()` calls in other tests will now also insert a `property_price_histories` row. Since those tests use `RefreshDatabase` and the migration runs cleanly, no existing test should break.

- [ ] **Step 5: Commit**

```
git add app/Observers/PropertyObserver.php
git add app/Providers/AppServiceProvider.php
git commit -m "feat: track property price changes via PropertyObserver"
```
