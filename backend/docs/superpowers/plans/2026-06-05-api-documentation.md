# API Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Scribe, configure it for the real estate API, annotate ~20 key controller methods with `@response` docblocks, and produce a complete OpenAPI 3.0 spec served at `/docs`.

**Architecture:** Scribe auto-reads all `api/v1/*` routes and extracts request schemas from FormRequest `rules()` arrays automatically. `@response` JSON docblocks on key endpoints supply response examples Scribe cannot infer. A lightweight `EnsureNotProduction` middleware blocks the `/docs` UI in production. Generated artifacts (`openapi.yaml`, `collection.json`) are committed to git.

**Tech Stack:** `knuckleswtf/scribe` (dev dependency), Laravel 12, PHP 8.2, PowerShell

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `app/Http/Middleware/EnsureNotProduction.php` | Create | Returns 404 in production environment |
| `config/scribe.php` | Modify (after publish) | Title, auth, route prefix, faker seed, middleware |
| `app/Http/Controllers/Api/V1/AuthController.php` | Modify | @group Auth + @response on login, logout, register, me |
| `app/Http/Controllers/Api/V1/PasswordResetController.php` | Modify | @group Auth + @response on forgotPassword, resetPassword |
| `app/Http/Controllers/Api/V1/PropertyController.php` | Modify | @group Properties + @response on index, show |
| `app/Http/Controllers/Api/V1/PropertyComparisonController.php` | Modify | @group Properties + @response on compare |
| `app/Http/Controllers/Api/V1/Admin/PropertyController.php` | Modify | @group Properties |
| `app/Http/Controllers/Api/V1/Admin/PropertyImageController.php` | Modify | @group Properties |
| `app/Http/Controllers/Api/V1/Admin/PropertyAmenityController.php` | Modify | @group Properties |
| `app/Http/Controllers/Api/V1/Admin/PropertyAgentController.php` | Modify | @group Properties |
| `app/Http/Controllers/Api/V1/LeadController.php` | Modify | @group Leads + @response on store, index, show |
| `app/Http/Controllers/Api/V1/BulkLeadController.php` | Modify | @group Leads + @response on updateStatus |
| `app/Http/Controllers/Api/V1/LeadTaskController.php` | Modify | @group Lead Tasks |
| `app/Http/Controllers/Api/V1/Admin/AgencyController.php` | Modify | @group Agencies & Agents |
| `app/Http/Controllers/Api/V1/Admin/AgentController.php` | Modify | @group Agencies & Agents |
| `app/Http/Controllers/Api/V1/AreaController.php` | Modify | @group Master Data |
| `app/Http/Controllers/Api/V1/DeveloperController.php` | Modify | @group Master Data |
| `app/Http/Controllers/Api/V1/OperationTypeController.php` | Modify | @group Master Data |
| `app/Http/Controllers/Api/V1/Admin/AreaController.php` | Modify | @group Master Data |
| `app/Http/Controllers/Api/V1/Admin/DeveloperController.php` | Modify | @group Master Data |
| `app/Http/Controllers/Api/V1/Admin/OperationTypeController.php` | Modify | @group Master Data |
| `app/Http/Controllers/Api/V1/Admin/DashboardController.php` | Modify | @group Dashboard & Reports + @response on stats, agentPerformance |
| `app/Http/Controllers/Api/V1/Admin/ReportController.php` | Modify | @group Dashboard & Reports + @response on leadFunnel, leadsOverTime, agentLeaderboard |
| `app/Http/Controllers/Api/V1/Admin/ActivityLogController.php` | Modify | @group Dashboard & Reports |
| `app/Http/Controllers/Api/V1/Admin/NotificationController.php` | Modify | @group Notifications + @response on index, unreadCount |
| `app/Http/Controllers/Api/V1/Admin/UserController.php` | Modify | @group Users & Favorites |
| `app/Http/Controllers/Api/V1/FavoritesController.php` | Modify | @group Users & Favorites |
| `public/docs/openapi.yaml` | Generated | OpenAPI 3.0 spec (committed after each generate) |
| `public/docs/collection.json` | Generated | Postman collection (committed after each generate) |

---

## Task 1: Install Scribe

**Files:** `composer.json`, `composer.lock`, `config/scribe.php` (published)

- [ ] **Step 1: Install Scribe as a dev dependency**

```powershell
cd d:\laragon\www\evoorion\backend
composer require --dev knuckleswtf/scribe
```

Expected: completes without errors, `composer.json` updated.

- [ ] **Step 2: Publish Scribe config**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan vendor:publish --tag=scribe-config
```

Expected: `config/scribe.php` created.

- [ ] **Step 3: Confirm existing test suite still passes**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test
```

Expected: 179 tests, 513 assertions, all passing.

- [ ] **Step 4: Commit**

```powershell
git add composer.json composer.lock config/scribe.php
git commit -m "feat: install knuckleswtf/scribe for API documentation"
```

---

## Task 2: Configure Scribe & Create EnsureNotProduction Middleware

**Files:**
- Create: `app/Http/Middleware/EnsureNotProduction.php`
- Modify: `config/scribe.php`

- [ ] **Step 1: Create EnsureNotProduction middleware**

Create `app/Http/Middleware/EnsureNotProduction.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotProduction
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('production')) {
            abort(404);
        }

        return $next($request);
    }
}
```

- [ ] **Step 2: Apply the following changes to config/scribe.php**

Find and update each of these keys. All other keys stay at their published defaults.

```php
// 1. API title
'title' => 'Evoorion Real Estate API',

// 2. API description
'description' => 'Backend API for the Evoorion real estate platform. Admin endpoints require a Bearer token obtained from POST /api/v1/auth/login.',

// 3. In routes[0].match, restrict to api/v1 prefix
'prefixes' => ['api/v1/*'],

// 4. Entire 'laravel' section — add EnsureNotProduction to middleware
'laravel' => [
    'add_routes'         => true,
    'docs_url'           => '/docs',
    'oauth2_callback_url' => null,
    'middleware'         => [\App\Http\Middleware\EnsureNotProduction::class],
    'additional_config'  => [],
],

// 5. Entire 'auth' section — enable bearer auth
'auth' => [
    'enabled'     => true,
    'default'     => true,
    'in'          => 'bearer',
    'name'        => 'Authorization',
    'use_value'   => env('SCRIBE_AUTH_KEY'),
    'placeholder' => '{YOUR_BEARER_TOKEN}',
    'extra_info'  => 'Obtain a token via POST /api/v1/auth/login. Send as: Authorization: Bearer {token}',
],

// 6. In 'postman.overrides', add version
'overrides' => [
    'info.version'      => '1.0.0',
    'info.description'  => 'Evoorion Real Estate API — Postman Collection',
],

// 7. In 'groups', set tag display order
'groups' => [
    'default' => 'Endpoints',
    'order'   => [
        'Auth',
        'Properties',
        'Leads',
        'Lead Tasks',
        'Agencies & Agents',
        'Master Data',
        'Dashboard & Reports',
        'Notifications',
        'Users & Favorites',
    ],
],

// 8. In 'examples', fix faker seed for reproducible output
'examples' => [
    'faker_seed'    => 1,
    'models_source' => ['factoryCreate', 'factoryMake', 'databaseFirst'],
],
```

- [ ] **Step 3: Verify the /docs route is registered**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan route:list --path=docs
```

Expected: One row for `GET /docs` pointing to a Scribe controller.

- [ ] **Step 4: Commit**

```powershell
git add app/Http/Middleware/EnsureNotProduction.php config/scribe.php
git commit -m "feat: configure Scribe and add EnsureNotProduction middleware"
```

---

## Task 3: Initial Spec Generation (Baseline)

**Files:** `public/docs/openapi.yaml`, `public/docs/collection.json`, `public/docs/index.html`

- [ ] **Step 1: Run the generator**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan scribe:generate
```

Expected: Output ends with `All done`. No PHP errors or exceptions.

> **If you see 500 errors** during response calls for auth-protected routes, add this to `config/scribe.php` inside `routes[0].apply.response_calls`:
> ```php
> 'config' => ['APP_ENV' => 'documentation'],
> ```
> Then rerun `scribe:generate`.

- [ ] **Step 2: Verify openapi.yaml was created and contains routes**

```powershell
Select-String -Path "public/docs/openapi.yaml" -Pattern "/api/v1/auth/login" | Select-Object -First 3
```

Expected: At least one match.

- [ ] **Step 3: Verify Postman collection was created**

```powershell
Test-Path "public/docs/collection.json"
```

Expected: `True`

- [ ] **Step 4: Commit baseline output**

```powershell
git add public/docs/
git commit -m "docs: add baseline Scribe-generated OpenAPI spec (no response annotations yet)"
```

---

## Task 4: Annotate Auth Group

**Files:**
- Modify: `app/Http/Controllers/Api/V1/AuthController.php`
- Modify: `app/Http/Controllers/Api/V1/PasswordResetController.php`

- [ ] **Step 1: Add class @group docblock to AuthController**

Add immediately before `class AuthController`:

```php
/**
 * @group Auth
 *
 * Authentication: login, logout, registration, and current user profile.
 */
class AuthController
```

- [ ] **Step 2: Add method docblocks to AuthController**

Add before `public function login(Request $request): JsonResponse`:

```php
/**
 * Login
 *
 * Authenticate with email and password. Returns a Sanctum bearer token valid until revoked.
 *
 * @unauthenticated
 *
 * @response 200 {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": 1,
 *       "name": "Jane Smith",
 *       "email": "jane@evoorion.com",
 *       "role": "manager",
 *       "is_active": true,
 *       "last_login_at": "2025-01-15T10:00:00.000000Z"
 *     },
 *     "token": "1|abc123defghijklmnopqrstuvwxyz"
 *   },
 *   "message": "Login successful",
 *   "meta": []
 * }
 * @response 422 scenario="Invalid credentials" {
 *   "message": "The provided credentials are incorrect.",
 *   "errors": {"email": ["The provided credentials are incorrect."]}
 * }
 */
```

Add before `public function logout(Request $request): JsonResponse`:

```php
/**
 * Logout
 *
 * Revokes the current bearer token.
 *
 * @response 200 {
 *   "success": true,
 *   "data": null,
 *   "message": "Logout successful",
 *   "meta": []
 * }
 * @response 401 scenario="Unauthenticated" {"message": "Unauthenticated."}
 */
```

Add before `public function me(Request $request): JsonResponse`:

```php
/**
 * Current user
 *
 * Returns the authenticated user's profile.
 *
 * @response 200 {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "name": "Jane Smith",
 *     "email": "jane@evoorion.com",
 *     "role": "manager",
 *     "is_active": true,
 *     "last_login_at": "2025-01-15T10:00:00.000000Z"
 *   },
 *   "message": "User profile retrieved",
 *   "meta": []
 * }
 * @response 401 scenario="Unauthenticated" {"message": "Unauthenticated."}
 */
```

Add before `public function register(Request $request): JsonResponse`:

```php
/**
 * Register
 *
 * Create a new user account. The new user receives the 'user' role.
 *
 * @unauthenticated
 *
 * @response 201 {
 *   "success": true,
 *   "data": {
 *     "user": {"id": 2, "name": "Mark Jones", "email": "mark@example.com", "role": "user", "is_active": true},
 *     "token": "2|xyz789abcdefghijklmno"
 *   },
 *   "message": "Registration successful",
 *   "meta": []
 * }
 * @response 422 scenario="Email taken" {
 *   "message": "The email has already been taken.",
 *   "errors": {"email": ["The email has already been taken."]}
 * }
 */
```

- [ ] **Step 3: Add class @group and method docblocks to PasswordResetController**

Add before `class PasswordResetController`:

```php
/**
 * @group Auth
 *
 * Password reset flow: request a reset email, then submit a new password.
 */
```

Add before `public function forgotPassword(Request $request): JsonResponse`:

```php
/**
 * Forgot password
 *
 * Sends a password reset email. Response is always 200 regardless of whether
 * the email is registered — prevents user enumeration.
 *
 * @unauthenticated
 *
 * @response 200 {
 *   "success": true,
 *   "data": null,
 *   "message": "If that email is registered, a reset link has been sent.",
 *   "meta": []
 * }
 */
```

Add before `public function resetPassword(Request $request): JsonResponse`:

```php
/**
 * Reset password
 *
 * Resets the password using the token received by email. Revokes all existing Sanctum tokens.
 *
 * @unauthenticated
 *
 * @response 200 {
 *   "success": true,
 *   "data": null,
 *   "message": "Password reset successfully.",
 *   "meta": []
 * }
 * @response 422 scenario="Invalid or expired token" {
 *   "message": "This password reset token is invalid or has expired.",
 *   "errors": {"token": ["This password reset token is invalid or has expired."]}
 * }
 */
```

- [ ] **Step 4: Regenerate and verify Auth examples appear**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan scribe:generate
Select-String -Path "public/docs/openapi.yaml" -Pattern "Login successful" | Select-Object -First 2
```

Expected: At least one match confirming the @response was picked up.

- [ ] **Step 5: Commit**

```powershell
git add app/Http/Controllers/Api/V1/AuthController.php `
        app/Http/Controllers/Api/V1/PasswordResetController.php `
        public/docs/
git commit -m "docs: annotate Auth group with @response examples"
```

---

## Task 5: Annotate Properties Group

**Files:**
- Modify: `app/Http/Controllers/Api/V1/PropertyController.php`
- Modify: `app/Http/Controllers/Api/V1/PropertyComparisonController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/PropertyController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/PropertyImageController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/PropertyAmenityController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/PropertyAgentController.php`

- [ ] **Step 1: Add class @group docblock to public PropertyController**

Add before `class PropertyController`:

```php
/**
 * @group Properties
 *
 * Browse, search, and view available properties. No authentication required.
 */
```

- [ ] **Step 2: Add @response to PropertyController::index**

Add before `public function index(PropertyFilterRequest $request): JsonResponse`:

```php
/**
 * List properties
 *
 * Paginated list of available properties. Supports filtering, sorting, and search.
 *
 * @unauthenticated
 *
 * @queryParam search string Keyword search on title and description. Example: Palm Jumeirah
 * @queryParam area_id integer Filter by area ID. Example: 1
 * @queryParam operation_type_id integer Filter by operation type ID. Example: 1
 * @queryParam type string Filter by type. Allowed: villa, apartment, penthouse, townhouse, commercial. Example: villa
 * @queryParam featured boolean Show only featured properties. Example: true
 * @queryParam min_price number Minimum price. Example: 500000
 * @queryParam max_price number Maximum price. Example: 3000000
 * @queryParam developer_id integer Filter by developer ID. Example: 1
 * @queryParam bedrooms_min integer Minimum bedrooms. Example: 2
 * @queryParam bedrooms_max integer Maximum bedrooms. Example: 4
 * @queryParam bathrooms_min integer Minimum bathrooms. Example: 1
 * @queryParam sort_by string Field to sort by. Default: created_at. Example: price
 * @queryParam sort_direction string asc or desc. Default: desc. Example: asc
 * @queryParam per_page integer Items per page. Default: 15. Example: 15
 *
 * @response 200 {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "Luxury Villa in Palm Jumeirah",
 *       "slug": "luxury-villa-palm-jumeirah",
 *       "type": "villa",
 *       "price": "2500000.00",
 *       "currency": "AED",
 *       "bedrooms": 4,
 *       "bathrooms": 3,
 *       "area_sqft": "4500.00",
 *       "status": "available",
 *       "is_featured": true,
 *       "views_count": 120,
 *       "created_at": "2025-01-15T10:00:00.000000Z"
 *     }
 *   ],
 *   "message": "Operation successful",
 *   "meta": {
 *     "pagination": {
 *       "current_page": 1,
 *       "total": 42,
 *       "per_page": 15,
 *       "last_page": 3
 *     }
 *   }
 * }
 */
```

- [ ] **Step 3: Add @response to PropertyController::show**

Add before `public function show(Property $property): JsonResponse`:

```php
/**
 * Get property
 *
 * Retrieve a single property by slug. Increments the view count on each call.
 *
 * @unauthenticated
 *
 * @response 200 {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "title": "Luxury Villa in Palm Jumeirah",
 *     "slug": "luxury-villa-palm-jumeirah",
 *     "description": "A stunning 4-bedroom villa with private pool and sea view.",
 *     "type": "villa",
 *     "price": "2500000.00",
 *     "currency": "AED",
 *     "bedrooms": 4,
 *     "bathrooms": 3,
 *     "area_sqft": "4500.00",
 *     "status": "available",
 *     "is_featured": true,
 *     "roi_min": "6.00",
 *     "roi_max": "8.00",
 *     "views_count": 121,
 *     "area": {"id": 1, "name": "Palm Jumeirah"},
 *     "developer": {"id": 1, "name": "Emaar Properties"},
 *     "operation_type": {"id": 1, "name": "For Sale"},
 *     "images": [
 *       {"id": 1, "url": "https://res.cloudinary.com/demo/image/upload/v1/villa.jpg", "is_primary": true}
 *     ],
 *     "amenities": [
 *       {"id": 1, "name": "Swimming Pool"},
 *       {"id": 2, "name": "Gym"}
 *     ],
 *     "created_at": "2025-01-15T10:00:00.000000Z",
 *     "updated_at": "2025-01-20T08:30:00.000000Z"
 *   },
 *   "message": "Operation successful",
 *   "meta": []
 * }
 * @response 404 scenario="Not found" {"message": "No query results for model [App\\Models\\Property]."}
 */
```

- [ ] **Step 4: Add @group and @response to PropertyComparisonController**

Add before `class PropertyComparisonController extends Controller`:

```php
/**
 * @group Properties
 *
 * Compare 2–4 properties side by side.
 */
```

Add before `public function compare(Request $request): JsonResponse`:

```php
/**
 * Compare properties
 *
 * Compare 2 to 4 available properties by slug. Returns them in the requested order
 * plus a summary identifying the cheapest, most bedrooms, and largest by sqft.
 *
 * @unauthenticated
 *
 * @bodyParam slugs string[] required Array of 2–4 property slugs to compare. Example: ["luxury-villa-palm-jumeirah","city-apartment-downtown"]
 *
 * @response 200 {
 *   "success": true,
 *   "data": {
 *     "properties": [
 *       {
 *         "id": 1, "title": "Luxury Villa", "slug": "luxury-villa-palm-jumeirah",
 *         "price": "2500000.00", "bedrooms": 4, "bathrooms": 3, "area_sqft": "4500.00", "type": "villa"
 *       },
 *       {
 *         "id": 2, "title": "City Apartment", "slug": "city-apartment-downtown",
 *         "price": "800000.00", "bedrooms": 2, "bathrooms": 2, "area_sqft": "1200.00", "type": "apartment"
 *       }
 *     ],
 *     "summary": {
 *       "cheapest": "city-apartment-downtown",
 *       "most_bedrooms": "luxury-villa-palm-jumeirah",
 *       "largest": "luxury-villa-palm-jumeirah"
 *     }
 *   }
 * }
 * @response 422 scenario="Fewer than 2 available slugs" {
 *   "success": false,
 *   "message": "At least 2 available properties are required for comparison"
 * }
 */
```

- [ ] **Step 5: Add @group to Admin property-related controllers (class docblocks only)**

`Admin\PropertyController` — add before `class PropertyController extends Controller`:
```php
/**
 * @group Properties
 *
 * Admin: full CRUD for property listings. Requires manager or super_admin role.
 */
```

`Admin\PropertyImageController` — add before `class PropertyImageController extends Controller`:
```php
/**
 * @group Properties
 *
 * Admin: upload and manage property images. Requires manager or super_admin role.
 */
```

`Admin\PropertyAmenityController` — add before `class PropertyAmenityController extends Controller`:
```php
/**
 * @group Properties
 *
 * Admin: manage amenities attached to a specific property. Requires manager or super_admin role.
 */
```

`Admin\PropertyAgentController` — add before `class PropertyAgentController extends Controller`:
```php
/**
 * @group Properties
 *
 * Admin: assign and unassign agents to properties. Requires manager or super_admin role.
 */
```

- [ ] **Step 6: Regenerate and verify Properties examples appear**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan scribe:generate
Select-String -Path "public/docs/openapi.yaml" -Pattern "Luxury Villa" | Select-Object -First 2
```

Expected: At least one match.

- [ ] **Step 7: Commit**

```powershell
git add app/Http/Controllers/Api/V1/PropertyController.php `
        app/Http/Controllers/Api/V1/PropertyComparisonController.php `
        app/Http/Controllers/Api/V1/Admin/PropertyController.php `
        app/Http/Controllers/Api/V1/Admin/PropertyImageController.php `
        app/Http/Controllers/Api/V1/Admin/PropertyAmenityController.php `
        app/Http/Controllers/Api/V1/Admin/PropertyAgentController.php `
        public/docs/
git commit -m "docs: annotate Properties group with @response examples"
```

---

## Task 6: Annotate Leads Group

**Files:**
- Modify: `app/Http/Controllers/Api/V1/LeadController.php`
- Modify: `app/Http/Controllers/Api/V1/BulkLeadController.php`
- Modify: `app/Http/Controllers/Api/V1/LeadTaskController.php`

- [ ] **Step 1: Add class @group docblock to LeadController**

Add before `class LeadController extends Controller`:

```php
/**
 * @group Leads
 *
 * Submit leads (public) and manage them (admin). Agents see only their assigned leads
 * and unassigned leads — not other agents' leads.
 */
```

- [ ] **Step 2: Add @response to LeadController::store**

Add before `public function store(StoreLeadRequest $request): JsonResponse`:

```php
/**
 * Submit lead
 *
 * Public endpoint for visitors to express interest. Rate-limited to 10 requests per minute per IP.
 *
 * @unauthenticated
 *
 * @response 201 {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "name": "Ahmed Al-Rashid",
 *     "email": "ahmed@example.com",
 *     "phone": "+971501234567",
 *     "whatsapp": "+971501234567",
 *     "source": "website",
 *     "status": "new",
 *     "property_id": null,
 *     "budget_min": "500000.00",
 *     "budget_max": "1000000.00",
 *     "message": "Looking for a 2-bedroom apartment near the metro.",
 *     "assigned_to": null,
 *     "created_at": "2025-01-15T10:00:00.000000Z",
 *     "updated_at": "2025-01-15T10:00:00.000000Z"
 *   },
 *   "message": "Lead submitted successfully"
 * }
 * @response 422 scenario="Validation error" {
 *   "message": "The source field is required.",
 *   "errors": {"source": ["The source field is required."]}
 * }
 */
```

- [ ] **Step 3: Add @response to LeadController::index**

Add before `public function index(Request $request): JsonResponse`:

```php
/**
 * List leads
 *
 * Paginated list of leads. Managers see all leads; agents see only their assigned and unassigned leads.
 *
 * @queryParam status string Filter by status. Allowed: new, contacted, qualified, closed, lost. Example: new
 * @queryParam search string Search by name, email, or phone. Example: Ahmed
 * @queryParam date_from string Filter from date (YYYY-MM-DD). Example: 2025-01-01
 * @queryParam date_to string Filter to date (YYYY-MM-DD). Example: 2025-01-31
 *
 * @response 200 {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Ahmed Al-Rashid",
 *       "email": "ahmed@example.com",
 *       "phone": "+971501234567",
 *       "status": "new",
 *       "source": "website",
 *       "assigned_to": null,
 *       "created_at": "2025-01-15T10:00:00.000000Z"
 *     }
 *   ],
 *   "meta": {
 *     "total": 35,
 *     "per_page": 15,
 *     "current_page": 1,
 *     "last_page": 3
 *   }
 * }
 * @response 401 scenario="Unauthenticated" {"message": "Unauthenticated."}
 */
```

- [ ] **Step 4: Add @response to LeadController::show**

Add before `public function show(Lead $lead): JsonResponse`:

```php
/**
 * Get lead
 *
 * Returns a single lead with its notes, assigned user, and linked property.
 *
 * @response 200 {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "name": "Ahmed Al-Rashid",
 *     "email": "ahmed@example.com",
 *     "phone": "+971501234567",
 *     "whatsapp": "+971501234567",
 *     "status": "contacted",
 *     "source": "website",
 *     "budget_min": "500000.00",
 *     "budget_max": "1000000.00",
 *     "message": "Looking for a 2-bedroom apartment.",
 *     "property": {"id": 1, "title": "Luxury Villa in Palm Jumeirah"},
 *     "assigned_user": {"id": 2, "name": "Jane Agent", "email": "jane@evoorion.com"},
 *     "notes": [
 *       {"id": 1, "note": "Called client, scheduled viewing for 20 Jan.", "created_at": "2025-01-16T09:00:00.000000Z"}
 *     ],
 *     "created_at": "2025-01-15T10:00:00.000000Z",
 *     "updated_at": "2025-01-16T09:00:00.000000Z"
 *   }
 * }
 * @response 403 scenario="Agent accessing another agent's lead" {"message": "This action is unauthorized."}
 * @response 404 scenario="Not found" {"message": "No query results for model [App\\Models\\Lead]."}
 */
```

- [ ] **Step 5: Add class @group and @response to BulkLeadController**

Add before `class BulkLeadController extends Controller`:

```php
/**
 * @group Leads
 *
 * Bulk operations on up to 100 leads at a time. All endpoints require manager or super_admin role.
 */
```

Add before `public function updateStatus(BulkLeadRequest $request): JsonResponse`:

```php
/**
 * Bulk update status
 *
 * Update the status of multiple leads at once. Accepts up to 100 IDs.
 *
 * @response 200 {
 *   "success": true,
 *   "message": "5 leads updated to status 'contacted'",
 *   "updated": 5
 * }
 * @response 422 scenario="Validation error" {
 *   "message": "The status field is required.",
 *   "errors": {"status": ["The status field is required."]}
 * }
 * @response 403 scenario="Agent role (insufficient permissions)" {"message": "This action is unauthorized."}
 */
```

- [ ] **Step 6: Add class @group to LeadTaskController**

Add before `class LeadTaskController extends Controller`:

```php
/**
 * @group Lead Tasks
 *
 * Follow-up tasks attached to leads. Agents can manage tasks only on their own leads.
 */
```

- [ ] **Step 7: Regenerate and verify Leads examples appear**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan scribe:generate
Select-String -Path "public/docs/openapi.yaml" -Pattern "Ahmed Al-Rashid" | Select-Object -First 2
```

Expected: At least one match.

- [ ] **Step 8: Commit**

```powershell
git add app/Http/Controllers/Api/V1/LeadController.php `
        app/Http/Controllers/Api/V1/BulkLeadController.php `
        app/Http/Controllers/Api/V1/LeadTaskController.php `
        public/docs/
git commit -m "docs: annotate Leads and Lead Tasks groups with @response examples"
```

---

## Task 7: Annotate Dashboard, Reports & Notifications Groups

**Files:**
- Modify: `app/Http/Controllers/Api/V1/Admin/DashboardController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/ReportController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/ActivityLogController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/NotificationController.php`

- [ ] **Step 1: Add class @group docblock to DashboardController**

Add before `class DashboardController extends Controller`:

```php
/**
 * @group Dashboard & Reports
 *
 * Aggregated platform statistics and agent performance metrics. Requires agent role or above.
 */
```

- [ ] **Step 2: Add @response to DashboardController::stats**

Add before `public function stats(): JsonResponse`:

```php
/**
 * Dashboard stats
 *
 * Platform-wide counts: leads by status and source, active agents, and property availability.
 *
 * @response 200 {
 *   "success": true,
 *   "data": {
 *     "leads": {
 *       "total": 142,
 *       "unassigned": 18,
 *       "this_month": 24,
 *       "last_month": 31,
 *       "by_status": {"new": 45, "contacted": 38, "qualified": 22, "closed": 28, "lost": 9},
 *       "by_source": {"website": 60, "instagram": 35, "facebook": 28, "whatsapp": 14, "referral": 5}
 *     },
 *     "agents": {"total": 8, "active": 7},
 *     "properties": {"total": 56, "available": 42, "featured": 10}
 *   }
 * }
 * @response 401 scenario="Unauthenticated" {"message": "Unauthenticated."}
 */
```

- [ ] **Step 3: Add @response to DashboardController::agentPerformance**

Add before `public function agentPerformance(): JsonResponse`:

```php
/**
 * Agent performance
 *
 * Per-agent breakdown: assigned properties, total leads, closed leads, and close rate.
 *
 * @response 200 {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Jane Agent",
 *       "email": "jane@evoorion.com",
 *       "properties": 5,
 *       "leads_total": 32,
 *       "leads_closed": 12,
 *       "close_rate": 37.5
 *     },
 *     {
 *       "id": 2,
 *       "name": "Mark Smith",
 *       "email": "mark@evoorion.com",
 *       "properties": 3,
 *       "leads_total": 18,
 *       "leads_closed": 6,
 *       "close_rate": 33.3
 *     }
 *   ]
 * }
 */
```

- [ ] **Step 4: Add class @group docblock to ReportController**

Add before `class ReportController extends Controller`:

```php
/**
 * @group Dashboard & Reports
 *
 * Analytics reports for leads, properties, and agent rankings. Requires agent role or above.
 */
```

- [ ] **Step 5: Add @response to ReportController::leadFunnel**

Add before `public function leadFunnel(): JsonResponse`:

```php
/**
 * Lead funnel
 *
 * Count of leads at each pipeline stage plus overall conversion rate.
 *
 * @response 200 {
 *   "success": true,
 *   "data": {
 *     "funnel": [
 *       {"status": "new", "count": 45},
 *       {"status": "contacted", "count": 38},
 *       {"status": "qualified", "count": 22},
 *       {"status": "closed", "count": 28},
 *       {"status": "lost", "count": 9}
 *     ],
 *     "total": 142,
 *     "conversion_rate": 19.7,
 *     "new_to_close_rate": 19.7
 *   }
 * }
 */
```

- [ ] **Step 6: Add @response to ReportController::leadsOverTime**

Add before `public function leadsOverTime(Request $request): JsonResponse`:

```php
/**
 * Leads over time
 *
 * Daily lead counts for the last N days (default 30, max 90). Every day appears — zero-filled.
 *
 * @queryParam days integer Days to look back (1–90). Default: 30. Example: 30
 *
 * @response 200 {
 *   "success": true,
 *   "data": [
 *     {"date": "2025-01-01", "total": 3},
 *     {"date": "2025-01-02", "total": 0},
 *     {"date": "2025-01-03", "total": 5}
 *   ]
 * }
 */
```

- [ ] **Step 7: Add @response to ReportController::agentLeaderboard**

Add before `public function agentLeaderboard(): JsonResponse`:

```php
/**
 * Agent leaderboard
 *
 * All agents ranked by leads closed descending, with close rate percentage.
 *
 * @response 200 {
 *   "success": true,
 *   "data": [
 *     {"id": 1, "name": "Jane Agent", "leads_total": 32, "leads_closed": 12, "leads_new": 8, "close_rate": 37.5},
 *     {"id": 2, "name": "Mark Smith", "leads_total": 18, "leads_closed": 6, "leads_new": 5, "close_rate": 33.3}
 *   ]
 * }
 */
```

- [ ] **Step 8: Add class @group to ActivityLogController**

Add before the `class ActivityLogController extends Controller` declaration:

```php
/**
 * @group Dashboard & Reports
 *
 * Audit trail of field-level changes to leads. Requires manager or super_admin role.
 */
```

- [ ] **Step 9: Add class @group docblock to NotificationController**

Add before `class NotificationController extends Controller`:

```php
/**
 * @group Notifications
 *
 * In-app notifications for the authenticated user. Each user sees only their own notifications.
 */
```

- [ ] **Step 10: Add @response to NotificationController::index**

Add before `public function index(Request $request): JsonResponse`:

```php
/**
 * List notifications
 *
 * Paginated list of the authenticated user's notifications. Pass `?unread=true` to filter unread only.
 *
 * @queryParam unread boolean Return only unread notifications. Example: true
 *
 * @response 200 {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "type": "App\\Notifications\\LeadAssigned",
 *       "data": {"lead_id": 1, "lead_name": "Ahmed Al-Rashid"},
 *       "read_at": null,
 *       "created_at": "2025-01-15T10:00:00.000000Z"
 *     }
 *   ],
 *   "meta": {
 *     "total": 5,
 *     "per_page": 20,
 *     "current_page": 1,
 *     "last_page": 1,
 *     "unread_count": 3
 *   }
 * }
 */
```

- [ ] **Step 11: Add @response to NotificationController::unreadCount**

Add before `public function unreadCount(): JsonResponse`:

```php
/**
 * Unread count
 *
 * Returns the number of unread notifications for the authenticated user.
 *
 * @response 200 {
 *   "success": true,
 *   "data": {"count": 3}
 * }
 */
```

- [ ] **Step 12: Regenerate and verify**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan scribe:generate
Select-String -Path "public/docs/openapi.yaml" -Pattern "conversion_rate" | Select-Object -First 2
```

Expected: At least one match.

- [ ] **Step 13: Commit**

```powershell
git add app/Http/Controllers/Api/V1/Admin/DashboardController.php `
        app/Http/Controllers/Api/V1/Admin/ReportController.php `
        app/Http/Controllers/Api/V1/Admin/ActivityLogController.php `
        app/Http/Controllers/Api/V1/Admin/NotificationController.php `
        public/docs/
git commit -m "docs: annotate Dashboard, Reports, and Notifications groups"
```

---

## Task 8: Annotate Remaining Groups & Final Verification

**Files:**
- Modify: `app/Http/Controllers/Api/V1/Admin/AgencyController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/AgentController.php`
- Modify: `app/Http/Controllers/Api/V1/AreaController.php`
- Modify: `app/Http/Controllers/Api/V1/DeveloperController.php`
- Modify: `app/Http/Controllers/Api/V1/OperationTypeController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/AreaController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/DeveloperController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/OperationTypeController.php`
- Modify: `app/Http/Controllers/Api/V1/Admin/UserController.php`
- Modify: `app/Http/Controllers/Api/V1/FavoritesController.php`

- [ ] **Step 1: Add @group to AgencyController and AgentController**

`AgencyController` — add before `class AgencyController extends Controller`:
```php
/**
 * @group Agencies & Agents
 *
 * Manage real estate agencies. Read (list/show) requires agent role; write requires manager or above.
 */
```

`AgentController` — add before `class AgentController extends Controller`:
```php
/**
 * @group Agencies & Agents
 *
 * Manage individual agents. Creating an agent atomically creates a linked User record.
 * Read requires agent role; write requires manager or above.
 */
```

- [ ] **Step 2: Add @group to public master data controllers**

`AreaController` (public, `Api/V1/AreaController.php`) — add before the class declaration:
```php
/**
 * @group Master Data
 *
 * Reference data: geographic areas. Public read — no authentication required.
 */
```

`DeveloperController` (public, `Api/V1/DeveloperController.php`) — add before the class declaration:
```php
/**
 * @group Master Data
 *
 * Reference data: property developers. Public read — no authentication required.
 */
```

`OperationTypeController` (public, `Api/V1/OperationTypeController.php`) — add before the class declaration:
```php
/**
 * @group Master Data
 *
 * Reference data: operation types (e.g. For Sale, For Rent). Public read — no authentication required.
 */
```

- [ ] **Step 3: Add @group to admin master data controllers**

`Admin\AreaController` — add before `class AreaController extends Controller`:
```php
/**
 * @group Master Data
 *
 * Admin: full CRUD for geographic areas. Requires manager or super_admin role.
 */
```

`Admin\DeveloperController` — add before `class DeveloperController extends Controller`:
```php
/**
 * @group Master Data
 *
 * Admin: full CRUD for property developers. Requires manager or super_admin role.
 */
```

`Admin\OperationTypeController` — add before `class OperationTypeController extends Controller`:
```php
/**
 * @group Master Data
 *
 * Admin: full CRUD for operation types. Requires manager or super_admin role.
 */
```

- [ ] **Step 4: Add @group to UserController and FavoritesController**

`UserController` — add before `class UserController extends Controller`:
```php
/**
 * @group Users & Favorites
 *
 * User account management (list, update, soft-delete, restore). All actions require super_admin role.
 */
```

`FavoritesController` — add before `class FavoritesController extends Controller`:
```php
/**
 * @group Users & Favorites
 *
 * Save and retrieve favorited properties for the authenticated user.
 */
```

- [ ] **Step 5: Final generation**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan scribe:generate
```

Expected: No errors. All 9 groups visible in output log.

- [ ] **Step 6: Verify all 9 groups appear in the YAML tags section**

```powershell
Select-String -Path "public/docs/openapi.yaml" -Pattern "^\s*- name:" | ForEach-Object { $_.Line.Trim() }
```

Expected output includes all of:
```
- name: Auth
- name: Properties
- name: Leads
- name: Lead Tasks
- name: Agencies & Agents
- name: Master Data
- name: Dashboard & Reports
- name: Notifications
- name: Users & Favorites
```

- [ ] **Step 7: Run full test suite — confirm zero regressions**

```powershell
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test
```

Expected: 179 tests, 513 assertions, all passing. (Docblocks do not affect runtime behavior.)

- [ ] **Step 8: Commit final state**

```powershell
git add app/Http/Controllers/ public/docs/
git commit -m "docs: complete API documentation — all 9 groups annotated, OpenAPI spec generated"
```
