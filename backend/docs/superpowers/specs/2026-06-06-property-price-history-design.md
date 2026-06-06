# Property Price History — Design Spec

**Date:** 2026-06-06
**Status:** Approved

---

## Problem

When an admin updates a property's price, the previous price is silently overwritten. There is no record of what the price was, when it changed, or who changed it.

---

## Scope

Silent audit trail only — record every price change (including initial creation) in a dedicated table. No read endpoint in this iteration.

---

## Approach

A `PropertyObserver` hooks into Laravel's model events (`created`, `updating`) and inserts a row into `property_price_histories` whenever a price is set or changed. No changes to controllers, requests, or `PropertyService`.

---

## Data Model

### Migration: `property_price_histories`

| Column | Type | Constraints |
|---|---|---|
| `id` | bigIncrements | PK |
| `property_id` | unsignedBigInteger | FK → properties, cascade delete |
| `price` | decimal(15,2) | price at this point in time |
| `currency` | varchar(10) | currency at this point in time |
| `changed_by` | unsignedBigInteger | nullable, FK → users (nullable for seed/system creates) |
| `created_at` | timestamp | append-only, no `updated_at` |

Rows are append-only and never modified.

### Model: `PropertyPriceHistory`

- `$fillable`: `property_id`, `price`, `currency`, `changed_by`
- `$timestamps = false` with `const CREATED_AT = 'created_at'` — only the creation timestamp is stored.
- `property(): BelongsTo` → `Property`
- `changedBy(): BelongsTo(User, 'changed_by')`

### Relationship on `Property`

```php
public function priceHistory(): HasMany
{
    return $this->hasMany(PropertyPriceHistory::class)->orderByDesc('created_at');
}
```

---

## Observer

### `app/Observers/PropertyObserver.php`

**`created(Property $property)`**
Always runs. Records the initial price, currency, and `auth()->id()` (null if unauthenticated).

**`updating(Property $property)`**
Runs before the update is persisted. Checks `$property->isDirty('price')`. If the price is changing, records the new price (`$property->price`), the current currency (`$property->currency`), and `auth()->id()`.

```php
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
```

### Registration

`AppServiceProvider::boot()` alongside the existing `LeadObserver`:

```php
Property::observe(PropertyObserver::class);
```

---

## Files Changed

| File | Change |
|---|---|
| `database/migrations/YYYY_MM_DD_create_property_price_histories_table.php` | New migration |
| `app/Models/PropertyPriceHistory.php` | New model |
| `app/Observers/PropertyObserver.php` | New observer |
| `app/Providers/AppServiceProvider.php` | Register observer |
| `app/Models/Property.php` | Add `priceHistory()` relationship |
| `tests/Feature/Properties/PropertyPriceHistoryTest.php` | New test file (5 tests) |

---

## Testing

File: `tests/Feature/Properties/PropertyPriceHistoryTest.php`

| Test | Assertion |
|---|---|
| `test_initial_price_recorded_on_create` | One history row with correct price and `changed_by` after property creation |
| `test_price_change_recorded_on_update` | New history row with new price after price update |
| `test_non_price_update_does_not_create_history` | No new history row when only non-price fields change |
| `test_history_ordered_newest_first` | `priceHistory` returns rows newest-first after multiple changes |
| `test_changed_by_is_null_when_no_auth` | `changed_by` is null when property created outside authenticated request |

All tests use `RefreshDatabase` and real SQLite. No mocking.
