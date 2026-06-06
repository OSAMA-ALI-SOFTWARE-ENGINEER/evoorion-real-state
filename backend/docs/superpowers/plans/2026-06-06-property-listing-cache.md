# Property Listing Cache Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cache `GET /api/v1/properties` responses using tag-based database caching, with full invalidation on all write operations.

**Architecture:** A new `PropertyService::listProperties()` method moves the filtered/paginated query out of the controller and wraps it in `Cache::tags(['properties'])->remember()`. The admin controller's `destroy()` and `restore()` methods are fixed to go through two new service methods (`deleteProperty`, `restoreProperty`) that handle invalidation. The public controller's `index()` becomes a thin delegation layer.

**Tech Stack:** Laravel 12, PHP 8.2, `Cache::tags()` with database driver (array driver in tests), SQLite (tests).

---

## File Map

| File | Change |
|---|---|
| `app/Services/PropertyService.php` | Add `listProperties()`, `deleteProperty()`, `restoreProperty()` |
| `app/Http/Controllers/Api/V1/PropertyController.php` | Simplify `index()` to delegate to `listProperties()` |
| `app/Http/Controllers/Api/V1/Admin/PropertyController.php` | Use `deleteProperty()` / `restoreProperty()` from service |
| `tests/Feature/Properties/PropertyCacheTest.php` | New — 5 tests |

Test command: `& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test`

---

## Task 1: Fix delete/restore invalidation gaps

### Files:
- Modify: `app/Services/PropertyService.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/PropertyController.php`
- Create: `tests/Feature/Properties/PropertyCacheTest.php`

- [ ] **Step 1: Create the test file with two failing tests**

Create `tests/Feature/Properties/PropertyCacheTest.php`:

```php
<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use App\Models\User;
use App\Services\PropertyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PropertyCacheTest extends TestCase
{
    use RefreshDatabase;

    private function warmCache(): void
    {
        $this->getJson('/api/v1/properties')->assertOk();
    }

    private function queryCountOnListing(): int
    {
        DB::enableQueryLog();
        $this->getJson('/api/v1/properties')->assertOk();
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();
        DB::flushQueryLog();

        return $count;
    }

    public function test_delete_invalidates_listing_cache(): void
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $this->warmCache();

        $this->actingAs($manager)
            ->deleteJson("/api/v1/admin/properties/{$property->slug}")
            ->assertOk();

        $this->assertGreaterThan(0, $this->queryCountOnListing());
    }

    public function test_restore_invalidates_listing_cache(): void
    {
        $manager  = User::factory()->create(['role' => 'manager']);
        $property = Property::factory()->create();
        $property->delete();
        $this->warmCache();

        $this->actingAs($manager)
            ->postJson("/api/v1/admin/properties/{$property->slug}/restore")
            ->assertOk();

        $this->assertGreaterThan(0, $this->queryCountOnListing());
    }
}
```

- [ ] **Step 2: Run the two new tests to confirm they FAIL**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter PropertyCacheTest
```

Expected: 2 failures — `assertGreaterThan(0, 0)` because delete/restore do not yet invalidate the cache.

- [ ] **Step 3: Add `deleteProperty` and `restoreProperty` to `PropertyService`**

Open `app/Services/PropertyService.php`. Add these two methods after `updateProperty()`:

```php
public function deleteProperty(Property $property): void
{
    $property->delete();
    $this->invalidateCache();
}

public function restoreProperty(Property $property): void
{
    $property->restore();
    $this->invalidateCache();
}
```

No new imports needed — `Property` is already imported.

- [ ] **Step 4: Update `Admin\PropertyController::destroy()` and `restore()`**

Open `app/Http/Controllers/Api/V1/Admin/PropertyController.php`.

Replace `destroy()`:
```php
public function destroy(Property $property): JsonResponse
{
    $this->propertyService->deleteProperty($property);

    return $this->success(null, 'Property deleted successfully');
}
```

Replace `restore()`:
```php
public function restore(Property $property): JsonResponse
{
    $this->propertyService->restoreProperty($property);

    return $this->success($property, 'Property restored successfully');
}
```

No new imports needed — `PropertyService` is already injected via the constructor.

- [ ] **Step 5: Run the two new tests — expect PASS**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter PropertyCacheTest
```

Expected: 2 tests, 2 passed.

- [ ] **Step 6: Run the full suite to confirm no regressions**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test
```

Expected: all 228 existing tests + 2 new = 230 tests passing, 0 failures.

- [ ] **Step 7: Commit**

```
git add app/Services/PropertyService.php
git add app/Http/Controllers/Api/V1/Admin/PropertyController.php
git add tests/Feature/Properties/PropertyCacheTest.php
git commit -m "feat: invalidate listing cache on property delete and restore"
```

---

## Task 2: Add `listProperties` cache to PropertyService

### Files:
- Modify: `app/Services/PropertyService.php`
- Modify: `app/Http/Controllers/Api/V1/PropertyController.php`
- Modify: `tests/Feature/Properties/PropertyCacheTest.php`

- [ ] **Step 1: Add three more tests to `PropertyCacheTest` — they will fail**

Open `tests/Feature/Properties/PropertyCacheTest.php`. Add three new test methods **inside the class**, after `test_restore_invalidates_listing_cache()`:

```php
public function test_listing_is_served_from_cache_on_second_call(): void
{
    Property::factory()->count(3)->create();
    $this->warmCache();

    $this->assertSame(0, $this->queryCountOnListing());
}

public function test_create_invalidates_listing_cache(): void
{
    $this->warmCache();
    app(PropertyService::class)->createProperty(
        Property::factory()->make()->toArray()
    );

    $this->assertGreaterThan(0, $this->queryCountOnListing());
}

public function test_update_invalidates_listing_cache(): void
{
    $property = Property::factory()->create();
    $this->warmCache();
    app(PropertyService::class)->updateProperty($property, ['title' => 'New Title']);

    $this->assertGreaterThan(0, $this->queryCountOnListing());
}
```

- [ ] **Step 2: Run all five cache tests — expect 3 new failures**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter PropertyCacheTest
```

Expected:
- `test_delete_invalidates_listing_cache` — PASS (from Task 1)
- `test_restore_invalidates_listing_cache` — PASS (from Task 1)
- `test_listing_is_served_from_cache_on_second_call` — FAIL (cache not wired up yet, second call still hits DB)
- `test_create_invalidates_listing_cache` — FAIL (no cache yet, can't measure a miss)
- `test_update_invalidates_listing_cache` — FAIL (same)

- [ ] **Step 3: Add `listProperties()` to `PropertyService`**

Open `app/Services/PropertyService.php`.

Add this import at the top alongside the existing ones:
```php
use App\Http\Requests\PropertyFilterRequest;
```

Add the `listProperties()` method after `restoreProperty()`:

```php
public function listProperties(PropertyFilterRequest $request): array
{
    $params = $request->only([
        'search', 'area_id', 'operation_type_id', 'type', 'featured',
        'min_price', 'max_price', 'developer_id', 'bedrooms_min', 'bedrooms_max',
        'bathrooms_min', 'sort_by', 'sort_direction', 'per_page', 'page',
    ]);
    ksort($params);
    $key = 'properties:list:' . md5(json_encode($params));

    return Cache::tags(['properties'])->remember($key, 3600, function () use ($request) {
        $query = Property::available();

        if ($request->filled('search')) {
            $query = $query->search($request->input('search'));
        }
        if ($request->filled('area_id')) {
            $query = $query->byArea($request->input('area_id'));
        }
        if ($request->filled('operation_type_id')) {
            $query = $query->byOperationType($request->input('operation_type_id'));
        }
        if ($request->filled('type')) {
            $query = $query->byType($request->input('type'));
        }
        if ($request->boolean('featured')) {
            $query = $query->featured();
        }
        if ($request->filled('min_price') && $request->filled('max_price')) {
            $query = $query->priceRange(
                $request->input('min_price'),
                $request->input('max_price')
            );
        }
        if ($request->filled('developer_id')) {
            $query = $query->byDeveloper($request->input('developer_id'));
        }
        if ($request->filled('bedrooms_min')) {
            $query = $query->where('bedrooms', '>=', $request->integer('bedrooms_min'));
        }
        if ($request->filled('bedrooms_max')) {
            $query = $query->where('bedrooms', '<=', $request->integer('bedrooms_max'));
        }
        if ($request->filled('bathrooms_min')) {
            $query = $query->where('bathrooms', '>=', $request->integer('bathrooms_min'));
        }

        $sortBy        = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage       = $request->input('per_page', 15);

        $paginated = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return [
            'items'        => $paginated->items(),
            'total'        => $paginated->total(),
            'per_page'     => (int) $perPage,
            'current_page' => $paginated->currentPage(),
        ];
    });
}
```

- [ ] **Step 4: Simplify `PropertyController::index()` to delegate to the service**

Open `app/Http/Controllers/Api/V1/PropertyController.php`. Replace the entire `index()` method body:

```php
public function index(PropertyFilterRequest $request): JsonResponse
{
    $result = $this->propertyService->listProperties($request);

    return $this->paginated(
        $result['items'],
        $result['total'],
        $result['per_page'],
        $result['current_page']
    );
}
```

All existing imports in this file remain unchanged.

- [ ] **Step 5: Run all five cache tests — expect all PASS**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter PropertyCacheTest
```

Expected: 5 tests, 5 passed.

- [ ] **Step 6: Run the full suite — expect all passing**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test
```

Expected: 233 tests passing (228 existing + 5 new), 0 failures.

- [ ] **Step 7: Commit**

```
git add app/Services/PropertyService.php
git add app/Http/Controllers/Api/V1/PropertyController.php
git add tests/Feature/Properties/PropertyCacheTest.php
git commit -m "feat: cache public property listing with tag-based database cache"
```
