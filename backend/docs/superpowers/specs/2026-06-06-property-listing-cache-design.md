# Property Listing Cache — Design Spec

**Date:** 2026-06-06
**Status:** Approved

---

## Problem

`GET /api/v1/properties` queries the database on every public request. With rate limiting at 120 req/min, even moderate traffic produces unnecessary DB load for data that changes infrequently.

---

## Scope

Cache the public property listing endpoint only:
- `GET /api/v1/properties` — paginated, filtered, sorted

Not in scope: `GET /api/v1/properties/{slug}` (view count increment makes full-response caching unreliable).

---

## Approach

Move the filtered/paginated query logic from `PropertyController::index()` into a new `PropertyService::listProperties()` method. The method wraps the query in a tag-based cache. The controller becomes a thin delegation layer.

Cache driver: **database** (default, no extra dependencies). Supports tags in Laravel 12. Tests use the **array** driver (already configured in `.env.testing`).

---

## Architecture

### `PropertyService::listProperties(PropertyFilterRequest $request): array`

New method. Responsible for:
1. Building the filtered + sorted + paginated Eloquent query (logic moved from `PropertyController::index()`).
2. Computing the cache key from all query params.
3. Wrapping the query execution in `Cache::tags(['properties'])->remember($key, 3600, callback)`.
4. Returning a plain array: `['items', 'total', 'per_page', 'current_page']`.

### `PropertyController::index(PropertyFilterRequest $request): JsonResponse`

Simplified to:
```php
$result = $this->propertyService->listProperties($request);
return $this->paginated($result['items'], $result['total'], $result['per_page'], $result['current_page']);
```

### Cache key

All query params that affect the result: `search`, `area_id`, `operation_type_id`, `type`, `featured`, `min_price`, `max_price`, `developer_id`, `bedrooms_min`, `bedrooms_max`, `bathrooms_min`, `sort_by`, `sort_direction`, `per_page`, `page`.

Key is ksorted (so param order doesn't produce different keys), then:
```
properties:list:{md5(json_encode($sorted_params))}
```

Tag: `['properties']`
TTL: `3600` seconds (matches existing `getCachedPropertiesByArea` / `getCachedPropertiesByDeveloper`)

---

## Invalidation

`Cache::tags(['properties'])->flush()` clears all listing cache entries atomically.

| Trigger | Status |
|---|---|
| `PropertyService::createProperty()` | ✅ already calls `invalidateCache()` |
| `PropertyService::updateProperty()` | ✅ already calls `invalidateCache()` |
| `Admin\PropertyController::destroy()` | ❌ fix: inject `PropertyService`, call `invalidateCache()` after `$property->delete()` |
| `Admin\PropertyController::restore()` | ❌ fix: inject `PropertyService`, call `invalidateCache()` after `$property->restore()` |

Image and amenity mutations are **not** invalidation triggers — the listing response does not include those fields.

---

## Testing

File: `tests/Feature/PropertyCacheTest.php`

**Test 1 — Cache hit:**
Call `GET /api/v1/properties` twice with identical params. Use `DB::enableQueryLog()` to assert the second call issues fewer DB queries than the first (the result was served from cache).

**Test 2 — Invalidation on create:**
Warm the cache, create a property via `PropertyService::createProperty()`, call the listing again. Assert DB queries are issued (cache was flushed).

**Test 3 — Invalidation on update:**
Warm the cache, update a property via `PropertyService::updateProperty()`, call again. Assert cache miss.

**Test 4 — Invalidation on delete:**
Warm the cache, delete via `Admin\PropertyController` (HTTP call), call listing again. Assert cache miss.

**Test 5 — Invalidation on restore:**
Warm the cache, restore via `Admin\PropertyController` (HTTP call), call listing again. Assert cache miss.

No mocking of `Cache` — tests run against the real array driver for fidelity.

---

## Files Changed

| File | Change |
|---|---|
| `app/Services/PropertyService.php` | Add `listProperties()` |
| `app/Http/Controllers/Api/V1/PropertyController.php` | Delegate `index()` to service |
| `app/Http/Controllers/Api/V1/Admin/PropertyController.php` | Inject `PropertyService`; call `invalidateCache()` in `destroy()` and `restore()` |
| `tests/Feature/PropertyCacheTest.php` | New test file (5 tests) |
