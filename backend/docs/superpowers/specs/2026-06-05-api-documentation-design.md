# API Documentation Design — Evoorion Real Estate API

**Date:** 2026-06-05
**Status:** Approved
**Scope:** OpenAPI 3.0 spec generation via Scribe for all `/api/v1` routes

---

## Goal

Produce a complete, maintained OpenAPI 3.0 spec that serves three consumers:
1. **Browsable HTML docs** — Swagger UI at `/docs` for frontend developers
2. **TypeScript client generation** — `openapi.yaml` fed into `@hey-api/openapi-ts`
3. **Postman import** — `collection.json` for manual API testing

---

## Approach: Scribe (auto-generate + response annotations)

Install `knuckleswtf/scribe` as a dev dependency. Scribe reads all routes, extracts request schemas from FormRequest `rules()` arrays automatically, and outputs OpenAPI YAML + Swagger UI. We supplement it with `@response` docblocks on ~20 key methods for accurate response examples.

**Why not hand-written YAML:** 55+ routes is too many to maintain manually; drift risk is high.
**Why not annotation-only (l5-swagger):** Too verbose; clutters controllers with boilerplate.

---

## Package Setup

```bash
composer require --dev knuckleswtf/scribe
php artisan vendor:publish --tag=scribe-config
```

**`config/scribe.php` key settings:**

| Setting | Value |
|---|---|
| `type` | `laravel` (serves UI via route, not static export) |
| `output_path` | `public/docs` |
| `title` | `Evoorion Real Estate API` |
| `version` | `1.0.0` |
| `auth.default` | `true` |
| `auth.in` | `bearer` |
| `auth.name` | `Authorization` |
| `routes[0].match.prefixes` | `['api/v1/*']` |
| `examples.faker_seed` | `1` |
| `laravel.middleware` | `['web']` + a custom `EnsureNotProduction` middleware — UI returns 404 in production |

**Regeneration command:** `php artisan scribe:generate`
Run after any route, FormRequest, or annotation change. Commit the result.

---

## Route Tags (8 groups)

Tags are assigned via `@group` on the controller class docblock.

| Tag | Controllers | Route count |
|---|---|---|
| `Auth` | AuthController, PasswordResetController | 6 |
| `Properties` | PropertyController, Admin\PropertyController, PropertyImageController, PropertyComparisonController, PropertyAmenityController, PropertyAgentController | 15 |
| `Leads` | LeadController, BulkLeadController | 14 |
| `Lead Tasks` | LeadTaskController | 5 |
| `Agencies & Agents` | AgencyController, AgentController | 7 |
| `Master Data` | AreaController, DeveloperController, OperationTypeController (public + admin) | 8 |
| `Dashboard & Reports` | DashboardController, ReportController, ActivityLogController | 8 |
| `Notifications` | NotificationController | 4 |
| `Users & Favorites` | UserController, FavoritesController | 6 |

---

## Response Annotation Targets

These ~20 methods get `@response` docblocks. All others return simple `{success, data, message, meta}` shapes that Scribe represents without hints.

### Auth
- `AuthController::login` — 200 (user + token), 422 (bad credentials)
- `AuthController::me` — 200 (user object)

### Properties
- `PropertyController::index` — 200 (paginated list with `meta.pagination`)
- `PropertyController::show` — 200 (property with images, amenities, area, developer, operationType relations)
- `PropertyComparisonController::compare` — 200 (ordered array + summary object)

### Leads
- `LeadController::store` — 201 (lead object)
- `LeadController::index` — 200 (paginated list with `meta`)
- `LeadController::show` — 200 (lead with notes, assignedUser, property)

### Dashboard & Reports
- `DashboardController::stats` — 200 (total_leads, new_leads, active_properties, conversion_rate)
- `DashboardController::agentPerformance` — 200 (array of agents with close_rate)
- `ReportController::leadFunnel` — 200 (status-keyed counts)
- `ReportController::leadsOverTime` — 200 (zero-filled time series array, date + count)
- `ReportController::agentLeaderboard` — 200 (ranked agent array)

### Notifications
- `NotificationController::index` — 200 (paginated notifications)
- `NotificationController::unreadCount` — 200 (`{ count: 3 }`)

### Bulk
- `BulkLeadController::updateStatus` — 200 (`{ updated: 5 }`)

---

## Annotation Format

Every annotated method follows this exact pattern:

```php
/**
 * @group Auth
 *
 * One-line description of what the endpoint does.
 *
 * @response 200 {
 *   "success": true,
 *   "data": { ... },
 *   "message": "Human-readable message",
 *   "meta": []
 * }
 * @response 422 scenario="Validation error" {
 *   "message": "The email field is required.",
 *   "errors": { "email": ["The email field is required."] }
 * }
 */
```

**Rules:**
- Always include 200/201 success example matching `{success, data, message, meta}` envelope
- Include 422 on every validated endpoint (Scribe auto-documents field rules; we add the error shape)
- Include `@response 401 scenario="Unauthenticated"` on auth-gated routes
- Include `@response 403 scenario="Unauthorized"` on role-gated routes
- Use `id: 1`, realistic names/emails, and fixed timestamps (`2025-01-15T10:00:00.000000Z`) in examples — no random values
- Paginated responses always include full `meta.pagination` block: `current_page`, `total`, `per_page`, `last_page`
- Request body parameters are **not** manually annotated — Scribe extracts them from FormRequest `rules()` automatically

---

## Output Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| OpenAPI 3.0 YAML | `public/docs/openapi.yaml` | Postman import, TS client generation |
| Swagger UI | `/docs` (Laravel route) | Browsable HTML reference |
| Postman collection | `public/docs/collection.json` | Direct Postman import |

`public/docs/` is committed to git. Scribe stays in `require-dev`.

---

## TypeScript Client Usage (frontend team)

```bash
npx @hey-api/openapi-ts -i http://localhost/docs/openapi.yaml -o src/client
```

No backend changes needed after spec is generated.

---

## Maintenance Workflow

1. Add/change a route, FormRequest, or controller method
2. Update `@response` annotation if the response shape changed
3. Run `php artisan scribe:generate`
4. Commit `public/docs/openapi.yaml` and `public/docs/collection.json` alongside the code change

---

## Security

- `/docs` UI is blocked in production via a middleware attached to Scribe's route (`EnsureNotProduction` returns 404 if `app()->environment('production')`)
- `public/docs/openapi.yaml` remains publicly accessible (intentional — frontend needs it; it contains no secrets)
- Bearer token auth is documented in the spec; Scribe adds a global security scheme automatically

---

## Out of Scope

- Email delivery for password reset / notifications (separate phase)
- Redis caching for properties endpoint (separate phase)
- Lead document attachments (separate phase)
