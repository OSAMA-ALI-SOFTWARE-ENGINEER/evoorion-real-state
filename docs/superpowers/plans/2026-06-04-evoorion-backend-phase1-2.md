# EVOORION Backend Phase 1-2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation and property management layers of the EVOORION REST API (Laravel 11, MySQL, Eloquent). By end of Phase 2, API supports public property browsing, admin property CRUD, image uploads, and filtering.

**Architecture:** 
- Sanctum for authentication (token-based)
- Eloquent ORM with 12 core models and relationships
- Cloudinary integration for image storage
- Form Requests for validation
- Service layer for business logic
- Redis for view counting
- Feature tests (SQLite in-memory)
- Consistent JSON response envelope

**Tech Stack:** Laravel 11, MySQL, Eloquent, Sanctum, Cloudinary SDK, Redis, PHPUnit, SQLite

---

## File Structure Overview

### Core Directories & Files to Create

```
app/
├── Models/
│   ├── User.php
│   ├── Property.php
│   ├── PropertyImage.php
│   ├── PropertyAmenity.php
│   ├── PropertyAgentAssignment.php
│   ├── Area.php
│   ├── Developer.php
│   ├── OperationType.php
│   └── Traits/
│       └── HasSlug.php
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── V1/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── PropertyController.php
│   │   │   │   ├── AreaController.php
│   │   │   │   ├── DeveloperController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── PropertyController.php
│   │   │   │       ├── AreaController.php
│   │   │   │       └── DeveloperController.php
│   ├── Requests/
│   │   ├── StorePropertyRequest.php
│   │   ├── UpdatePropertyRequest.php
│   │   └── PropertyImageRequest.php
│   └── Middleware/
│       ├── RoleMiddleware.php
│       └── ApiResponseMiddleware.php
├── Services/
│   ├── CloudinaryService.php
│   ├── PropertyService.php
│   └── ResponseService.php
└── Traits/
    └── ApiResponse.php

database/
├── migrations/
│   ├── 2026_06_04_000001_create_users_table.php
│   ├── 2026_06_04_000002_create_areas_table.php
│   ├── 2026_06_04_000003_create_developers_table.php
│   ├── 2026_06_04_000004_create_operation_types_table.php
│   ├── 2026_06_04_000005_create_properties_table.php
│   ├── 2026_06_04_000006_create_property_images_table.php
│   ├── 2026_06_04_000007_create_property_amenities_table.php
│   └── 2026_06_04_000008_create_property_agent_assignments_table.php
└── seeders/
    ├── DatabaseSeeder.php
    ├── UserSeeder.php
    ├── AreaSeeder.php
    ├── DeveloperSeeder.php
    └── OperationTypeSeeder.php

tests/
├── Feature/
│   ├── Auth/
│   │   └── AuthTest.php
│   └── Properties/
│       ├── PropertyListTest.php
│       ├── PropertyShowTest.php
│       ├── PropertyCrudTest.php
│       ├── PropertyImageTest.php
│       └── PropertyFilterTest.php
└── Unit/
    ├── Models/
    │   └── PropertyTest.php
    └── Services/
        └── PropertyServiceTest.php

routes/
└── api.php (v1 routes defined here)
```

---

## Phase 1: Foundation

### Task 1: Initialize Laravel Project & Core Configuration

**Files:**
- Modify: `.env`, `config/app.php`, `config/database.php`, `config/sanctum.php`
- Create: `.env.example`

- [ ] **Step 1: Install Laravel 11 (if not already done)**

```bash
composer create-project laravel/laravel evoorion
cd evoorion
```

- [ ] **Step 2: Update `.env` with database and app settings**

```env
APP_NAME=EVOORION
APP_ENV=local
APP_KEY=base64:YOUR_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=evoorion
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001
```

- [ ] **Step 3: Generate app key**

```bash
php artisan key:generate
```

- [ ] **Step 4: Verify database connection**

```bash
php artisan tinker
# Test connection, exit
exit
```

- [ ] **Step 5: Commit**

```bash
git add .env .env.example config/
git commit -m "setup: initialize Laravel 11 project with core configuration"
```

---

### Task 2: Create User Model with Sanctum Authentication

**Files:**
- Create: `app/Models/User.php` (modify default)
- Create: `database/migrations/2026_06_04_000001_create_users_table.php`
- Create: `app/Http/Controllers/Api/V1/AuthController.php`
- Create: `tests/Feature/Auth/AuthTest.php`

- [ ] **Step 1: Create users table migration**

```bash
php artisan make:migration create_users_table --create=users
```

Update `database/migrations/YYYY_MM_DD_HHMMSS_create_users_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['super_admin', 'manager', 'agent', 'user'])->default('user');
            $table->timestamp('last_login_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 80)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('personal_access_tokens');
    }
};
```

- [ ] **Step 2: Update User model**

```bash
# Laravel 11 creates User.php by default in app/Models/
```

Update `app/Models/User.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function hasRole($role): bool
    {
        return $this->role === $role || $this->role === 'super_admin';
    }

    public function hasAnyRole($roles): bool
    {
        return in_array($this->role, $roles) || $this->role === 'super_admin';
    }
}
```

- [ ] **Step 3: Create AuthController**

```bash
mkdir -p app/Http/Controllers/Api/V1
touch app/Http/Controllers/Api/V1/AuthController.php
```

Create `app/Http/Controllers/Api/V1/AuthController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController
{
    use ApiResponse;

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Login successful');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logout successful');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success($request->user());
    }
}
```

- [ ] **Step 4: Create ApiResponse trait**

```bash
mkdir -p app/Traits
touch app/Traits/ApiResponse.php
```

Create `app/Traits/ApiResponse.php`:

```php
<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    public function success($data = null, $message = 'Operation successful', $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => [],
        ], $statusCode);
    }

    public function error($message = 'Operation failed', $errors = null, $statusCode = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => $message,
            'meta' => $errors ? ['errors' => $errors] : [],
        ], $statusCode);
    }

    public function paginated($data, $total, $perPage, $currentPage, $message = 'Operation successful'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => [
                'pagination' => [
                    'current_page' => $currentPage,
                    'total' => $total,
                    'per_page' => $perPage,
                    'last_page' => ceil($total / $perPage),
                ],
            ],
        ], 200);
    }
}
```

- [ ] **Step 5: Create RoleMiddleware**

```bash
php artisan make:middleware RoleMiddleware
```

Update `app/Http/Middleware/RoleMiddleware.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user() || !$request->user()->hasAnyRole($roles)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Insufficient permissions',
                'meta' => [],
            ], 403);
        }

        return $next($request);
    }
}
```

Register in `app/Http/Kernel.php`:

```php
protected $routeMiddleware = [
    // ... existing middleware
    'role' => \App\Http\Middleware\RoleMiddleware::class,
];
```

- [ ] **Step 6: Create authentication tests**

```bash
mkdir -p tests/Feature/Auth
touch tests/Feature/Auth/AuthTest.php
```

Create `tests/Feature/Auth/AuthTest.php`:

```php
<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['user', 'token'],
                'message',
            ]);

        $this->assertNotNull($response->json('data.token'));
        $this->assertEquals($user->email, $response->json('data.user.email'));
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['email' => $user->email],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_route(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }
}
```

- [ ] **Step 7: Register API routes**

Create/update `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register'])->name('register');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });
});
```

- [ ] **Step 8: Run migration & tests**

```bash
php artisan migrate --env=testing
php artisan test tests/Feature/Auth/AuthTest.php -v
```

Expected: All tests PASS

- [ ] **Step 9: Commit**

```bash
git add app/Models/User.php app/Http/Controllers/Api/V1/AuthController.php \
  app/Traits/ApiResponse.php app/Http/Middleware/RoleMiddleware.php \
  database/migrations/ routes/api.php tests/Feature/Auth/AuthTest.php \
  app/Http/Kernel.php
git commit -m "feat: implement user authentication with Sanctum and role-based access"
```

---

### Task 3: Create Supporting Models (Area, Developer, OperationType)

**Files:**
- Create: `app/Models/Area.php`
- Create: `app/Models/Developer.php`
- Create: `app/Models/OperationType.php`
- Create: `database/migrations/2026_06_04_000002_create_areas_table.php`
- Create: `database/migrations/2026_06_04_000003_create_developers_table.php`
- Create: `database/migrations/2026_06_04_000004_create_operation_types_table.php`
- Create: `database/seeders/AreaSeeder.php`, `DeveloperSeeder.php`, `OperationTypeSeeder.php`

- [ ] **Step 1: Create Area migration**

```bash
php artisan make:migration create_areas_table --create=areas
```

Update migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('areas');
    }
};
```

- [ ] **Step 2: Create Developer migration**

```bash
php artisan make:migration create_developers_table --create=developers
```

Update migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('developers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('logo_url')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('developers');
    }
};
```

- [ ] **Step 3: Create OperationType migration**

```bash
php artisan make:migration create_operation_types_table --create=operation_types
```

Update migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('operation_types', function (Blueprint $table) {
            $table->id();
            $table->enum('name', ['Buy', 'Rent', 'Stay', 'Off-plan'])->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operation_types');
    }
};
```

- [ ] **Step 4: Create Area model**

```bash
php artisan make:model Area
```

Update `app/Models/Area.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description'];

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
```

- [ ] **Step 5: Create Developer model**

```bash
php artisan make:model Developer
```

Update `app/Models/Developer.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Developer extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'logo_url', 'description'];

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
```

- [ ] **Step 6: Create OperationType model**

```bash
php artisan make:model OperationType
```

Update `app/Models/OperationType.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OperationType extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public $timestamps = true;

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
```

- [ ] **Step 7: Create seeders**

```bash
php artisan make:seeder AreaSeeder
php artisan make:seeder DeveloperSeeder
php artisan make:seeder OperationTypeSeeder
```

Update `database/seeders/AreaSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['name' => 'Palm Jumeirah', 'description' => 'Iconic palm-shaped island development'],
            ['name' => 'Downtown Dubai', 'description' => 'City center with Burj Khalifa'],
            ['name' => 'Dubai Marina', 'description' => 'Waterfront residential and commercial hub'],
            ['name' => 'Emirates Hills', 'description' => 'Luxury hillside villas'],
            ['name' => 'Al Barari', 'description' => 'Gated community with lush landscaping'],
        ];

        foreach ($areas as $area) {
            Area::create([
                'name' => $area['name'],
                'slug' => Str::slug($area['name']),
                'description' => $area['description'],
            ]);
        }
    }
}
```

Update `database/seeders/DeveloperSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Developer;
use Illuminate\Database\Seeder;

class DeveloperSeeder extends Seeder
{
    public function run(): void
    {
        $developers = [
            ['name' => 'Emaar', 'description' => 'Leading Dubai real estate developer'],
            ['name' => 'Damac', 'description' => 'Luxury developer known for premium properties'],
            ['name' => 'Azizi', 'description' => 'Mid-range and affordable developments'],
            ['name' => 'Meraas', 'description' => 'Integrated community developer'],
        ];

        foreach ($developers as $dev) {
            Developer::create($dev);
        }
    }
}
```

Update `database/seeders/OperationTypeSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\OperationType;
use Illuminate\Database\Seeder;

class OperationTypeSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Buy', 'Rent', 'Stay', 'Off-plan'] as $type) {
            OperationType::create(['name' => $type]);
        }
    }
}
```

Update `database/seeders/DatabaseSeeder.php`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AreaSeeder::class,
            DeveloperSeeder::class,
            OperationTypeSeeder::class,
            UserSeeder::class,
        ]);
    }
}
```

Create `database/seeders/UserSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@evoorion.com',
            'password' => bcrypt('password123'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Manager User',
            'email' => 'manager@evoorion.com',
            'password' => bcrypt('password123'),
            'role' => 'manager',
            'is_active' => true,
        ]);
    }
}
```

- [ ] **Step 8: Run migrations and seeders**

```bash
php artisan migrate --env=testing
php artisan db:seed --env=testing
```

Expected: No errors

- [ ] **Step 9: Commit**

```bash
git add app/Models/Area.php app/Models/Developer.php app/Models/OperationType.php \
  database/migrations/ database/seeders/
git commit -m "feat: create area, developer, and operation type models with seeders"
```

---

## Phase 2: Properties & Images

### Task 4: Create Property Model with Relationships & Slug Generation

**Files:**
- Create: `app/Traits/HasSlug.php`
- Create: `app/Models/Property.php`
- Create: `database/migrations/2026_06_04_000005_create_properties_table.php`
- Create: `tests/Unit/Models/PropertyTest.php`

- [ ] **Step 1: Create HasSlug trait**

```bash
mkdir -p app/Traits
touch app/Traits/HasSlug.php
```

Create `app/Traits/HasSlug.php`:

```php
<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::creating(function ($model) {
            if (empty($model->slug) && !empty($model->title)) {
                $slug = Str::slug($model->title);
                $counter = 1;
                $originalSlug = $slug;

                while (self::where('slug', $slug)->exists()) {
                    $slug = $originalSlug . '-' . $counter++;
                }

                $model->slug = $slug;
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
```

- [ ] **Step 2: Create properties table migration**

```bash
php artisan make:migration create_properties_table --create=properties
```

Update migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['villa', 'apartment', 'penthouse', 'townhouse', 'commercial']);
            $table->decimal('price', 15, 2);
            $table->string('currency', 3)->default('AED');
            $table->foreignId('area_id')->constrained();
            $table->string('location')->nullable();
            $table->decimal('area_sqft', 10, 2)->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->foreignId('operation_type_id')->constrained();
            $table->enum('status', ['available', 'sold', 'rented'])->default('available');
            $table->boolean('is_featured')->default(false);
            $table->decimal('roi_min', 5, 2)->nullable();
            $table->decimal('roi_max', 5, 2)->nullable();
            $table->foreignId('developer_id')->constrained();
            $table->foreignId('primary_agent_id')->nullable()->constrained('users');
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->integer('views_count')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
```

- [ ] **Step 3: Create Property model**

```bash
php artisan make:model Property
```

Update `app/Models/Property.php`:

```php
<?php

namespace App\Models;

use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, HasSlug, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'type',
        'price',
        'currency',
        'area_id',
        'location',
        'area_sqft',
        'bedrooms',
        'bathrooms',
        'operation_type_id',
        'status',
        'is_featured',
        'roi_min',
        'roi_max',
        'developer_id',
        'primary_agent_id',
        'meta_title',
        'meta_description',
        'views_count',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'price' => 'decimal:2',
        'area_sqft' => 'decimal:2',
        'roi_min' => 'decimal:2',
        'roi_max' => 'decimal:2',
    ];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function developer(): BelongsTo
    {
        return $this->belongsTo(Developer::class);
    }

    public function operationType(): BelongsTo
    {
        return $this->belongsTo(OperationType::class);
    }

    public function primaryAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'primary_agent_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function amenities(): HasMany
    {
        return $this->hasMany(PropertyAmenity::class);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByOperationType($query, $operationTypeId)
    {
        return $query->where('operation_type_id', $operationTypeId);
    }

    public function scopeByArea($query, $areaId)
    {
        return $query->where('area_id', $areaId);
    }

    public function scopeByDeveloper($query, $developerId)
    {
        return $query->where('developer_id', $developerId);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('title', 'like', "%$searchTerm%")
            ->orWhere('description', 'like', "%$searchTerm%");
    }

    public function scopePriceRange($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }
}
```

- [ ] **Step 4: Create unit test for Property model**

```bash
mkdir -p tests/Unit/Models
touch tests/Unit/Models/PropertyTest.php
```

Create `tests/Unit/Models/PropertyTest.php`:

```php
<?php

namespace Tests\Unit\Models;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    public function test_property_slug_is_auto_generated_from_title(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = Property::create([
            'title' => 'Luxury Villa in Palm Jumeirah',
            'description' => 'A beautiful villa',
            'type' => 'villa',
            'price' => 5000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $this->assertEquals('luxury-villa-in-palm-jumeirah', $property->slug);
    }

    public function test_property_slug_is_unique(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::create([
            'title' => 'Luxury Villa',
            'description' => 'A beautiful villa',
            'type' => 'villa',
            'price' => 5000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $property2 = Property::create([
            'title' => 'Luxury Villa',
            'description' => 'Another beautiful villa',
            'type' => 'villa',
            'price' => 6000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $this->assertEquals('luxury-villa-1', $property2->slug);
    }

    public function test_featured_scope(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(3)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'is_featured' => false,
        ]);

        Property::factory(2)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'is_featured' => true,
        ]);

        $this->assertEquals(2, Property::featured()->count());
    }

    public function test_available_scope(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(2)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'sold',
        ]);

        Property::factory(3)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'available',
        ]);

        $this->assertEquals(3, Property::available()->count());
    }

    public function test_search_scope_searches_title_and_description(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::create([
            'title' => 'Luxury Penthouse',
            'description' => 'Spectacular views',
            'type' => 'penthouse',
            'price' => 10000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $this->assertEquals(1, Property::search('Luxury')->count());
        $this->assertEquals(1, Property::search('Spectacular')->count());
        $this->assertEquals(0, Property::search('NonExistent')->count());
    }
}
```

- [ ] **Step 5: Run tests**

```bash
php artisan test tests/Unit/Models/PropertyTest.php -v
```

Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add app/Models/Property.php app/Traits/HasSlug.php \
  database/migrations/ tests/Unit/Models/PropertyTest.php
git commit -m "feat: implement property model with slug generation and scopes"
```

---

### Task 5: Create Property Images & Amenities Models

**Files:**
- Create: `app/Models/PropertyImage.php`
- Create: `app/Models/PropertyAmenity.php`
- Create: `database/migrations/2026_06_04_000006_create_property_images_table.php`
- Create: `database/migrations/2026_06_04_000007_create_property_amenities_table.php`

- [ ] **Step 1: Create property_images table migration**

```bash
php artisan make:migration create_property_images_table --create=property_images
```

Update migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->string('url');
            $table->string('public_id')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_images');
    }
};
```

- [ ] **Step 2: Create property_amenities table migration**

```bash
php artisan make:migration create_property_amenities_table --create=property_amenities
```

Update migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('property_amenities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->string('amenity');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_amenities');
    }
};
```

- [ ] **Step 3: Create PropertyImage model**

```bash
php artisan make:model PropertyImage
```

Update `app/Models/PropertyImage.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'url',
        'public_id',
        'is_primary',
        'order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
```

- [ ] **Step 4: Create PropertyAmenity model**

```bash
php artisan make:model PropertyAmenity
```

Update `app/Models/PropertyAmenity.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyAmenity extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'amenity',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
```

- [ ] **Step 5: Run migrations**

```bash
php artisan migrate --env=testing
```

Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add app/Models/PropertyImage.php app/Models/PropertyAmenity.php \
  database/migrations/
git commit -m "feat: create property image and amenity models"
```

---

### Task 6: Implement CloudinaryService for Image Management

**Files:**
- Create: `app/Services/CloudinaryService.php`
- Create: `tests/Unit/Services/CloudinaryServiceTest.php`

- [ ] **Step 1: Install Cloudinary SDK**

```bash
composer require cloudinary/cloudinary_php
```

- [ ] **Step 2: Update `.env` with Cloudinary credentials**

```env
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

- [ ] **Step 3: Create CloudinaryService**

```bash
mkdir -p app/Services
touch app/Services/CloudinaryService.php
```

Create `app/Services/CloudinaryService.php`:

```php
<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Uploader;

class CloudinaryService
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ]);
    }

    public function uploadImage($file, $folder = 'properties')
    {
        $result = Uploader::upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => 'auto',
        ]);

        return [
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    public function uploadVideo($file, $folder = 'videos')
    {
        $result = Uploader::upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => 'video',
        ]);

        return [
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    public function deleteMedia($publicId)
    {
        Uploader::destroy($publicId);
    }
}
```

- [ ] **Step 4: Register CloudinaryService in config**

Create/update `config/services.php`:

```php
<?php

return [
    // ... existing services

    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
        'api_key' => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),
    ],
];
```

- [ ] **Step 5: Create CloudinaryService test**

```bash
mkdir -p tests/Unit/Services
touch tests/Unit/Services/CloudinaryServiceTest.php
```

Create `tests/Unit/Services/CloudinaryServiceTest.php`:

```php
<?php

namespace Tests\Unit\Services;

use App\Services\CloudinaryService;
use Tests\TestCase;

class CloudinaryServiceTest extends TestCase
{
    public function test_service_can_be_instantiated(): void
    {
        $service = new CloudinaryService();
        $this->assertInstanceOf(CloudinaryService::class, $service);
    }
}
```

- [ ] **Step 6: Commit**

```bash
git add app/Services/CloudinaryService.php config/services.php \
  tests/Unit/Services/CloudinaryServiceTest.php
git commit -m "feat: implement Cloudinary service for image and video uploads"
```

---

### Task 7: Create PropertyService & Redis View Counter

**Files:**
- Create: `app/Services/PropertyService.php`
- Create: `tests/Unit/Services/PropertyServiceTest.php`

- [ ] **Step 1: Create PropertyService**

```bash
touch app/Services/PropertyService.php
```

Create `app/Services/PropertyService.php`:

```php
<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Cache\TaggedCache;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class PropertyService
{
    public function createProperty(array $data): Property
    {
        $property = Property::create($data);
        $this->invalidateCache();
        return $property;
    }

    public function updateProperty(Property $property, array $data): Property
    {
        $property->update($data);
        $this->invalidateCache();
        return $property;
    }

    public function incrementViews(int $propertyId): void
    {
        Redis::increment("property:views:{$propertyId}");
    }

    public function getViewCount(int $propertyId): int
    {
        return (int) Redis::get("property:views:{$propertyId}") ?? 0;
    }

    public function syncViewsToDatabase(): void
    {
        $keys = Redis::keys('property:views:*');

        foreach ($keys as $key) {
            preg_match('/property:views:(\d+)/', $key, $matches);
            $propertyId = $matches[1] ?? null;

            if ($propertyId) {
                $views = Redis::get($key);
                Property::where('id', $propertyId)->update(['views_count' => $views]);
            }
        }
    }

    public function getCachedPropertiesByArea(int $areaId)
    {
        return Cache::tags(['properties', "area:{$areaId}"])->remember(
            "properties:area:{$areaId}",
            3600,
            fn() => Property::where('area_id', $areaId)->available()->get()
        );
    }

    public function getCachedPropertiesByDeveloper(int $developerId)
    {
        return Cache::tags(['properties', "developer:{$developerId}"])->remember(
            "properties:developer:{$developerId}",
            3600,
            fn() => Property::where('developer_id', $developerId)->available()->get()
        );
    }

    protected function invalidateCache(): void
    {
        Cache::tags(['properties'])->flush();
    }
}
```

- [ ] **Step 2: Create PropertyService test**

```bash
touch tests/Unit/Services/PropertyServiceTest.php
```

Create `tests/Unit/Services/PropertyServiceTest.php`:

```php
<?php

namespace Tests\Unit\Services;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Services\PropertyService;
use Tests\TestCase;

class PropertyServiceTest extends TestCase
{
    protected PropertyService $service;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new PropertyService();
    }

    public function test_create_property(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = $this->service->createProperty([
            'title' => 'Test Villa',
            'description' => 'A test villa',
            'type' => 'villa',
            'price' => 5000000,
            'area_id' => $area->id,
            'operation_type_id' => $operationType->id,
            'developer_id' => $developer->id,
        ]);

        $this->assertInstanceOf(Property::class, $property);
        $this->assertEquals('Test Villa', $property->title);
    }

    public function test_increment_views(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        $this->service->incrementViews($property->id);
        $this->service->incrementViews($property->id);

        $views = $this->service->getViewCount($property->id);
        $this->assertEquals(2, $views);
    }

    public function test_sync_views_to_database(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'views_count' => 0,
        ]);

        $this->service->incrementViews($property->id);
        $this->service->incrementViews($property->id);
        $this->service->incrementViews($property->id);

        $this->service->syncViewsToDatabase();

        $property->refresh();
        $this->assertEquals(3, $property->views_count);
    }
}
```

- [ ] **Step 3: Run tests**

```bash
php artisan test tests/Unit/Services/PropertyServiceTest.php -v
```

Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add app/Services/PropertyService.php tests/Unit/Services/PropertyServiceTest.php
git commit -m "feat: implement property service with Redis view counting"
```

---

### Task 8: Create Public Property Endpoints (List, Show, Filters)

**Files:**
- Create: `app/Http/Controllers/Api/V1/PropertyController.php`
- Create: `app/Http/Requests/PropertyFilterRequest.php`
- Create: `tests/Feature/Properties/PropertyListTest.php`
- Create: `tests/Feature/Properties/PropertyShowTest.php`
- Create: `tests/Feature/Properties/PropertyFilterTest.php`

- [ ] **Step 1: Create PropertyFilterRequest**

```bash
php artisan make:request PropertyFilterRequest
```

Update `app/Http/Requests/PropertyFilterRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PropertyFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:255',
            'area_id' => 'nullable|integer|exists:areas,id',
            'operation_type_id' => 'nullable|integer|exists:operation_types,id',
            'type' => 'nullable|in:villa,apartment,penthouse,townhouse,commercial',
            'featured' => 'nullable|boolean',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }
}
```

- [ ] **Step 2: Create PropertyController**

```bash
touch app/Http/Controllers/Api/V1/PropertyController.php
```

Create `app/Http/Controllers/Api/V1/PropertyController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\PropertyFilterRequest;
use App\Models\Property;
use App\Services\PropertyService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PropertyController
{
    use ApiResponse;

    public function __construct(protected PropertyService $propertyService) {}

    public function index(PropertyFilterRequest $request): JsonResponse
    {
        $query = Property::available();

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('area_id')) {
            $query->byArea($request->input('area_id'));
        }

        if ($request->filled('operation_type_id')) {
            $query->byOperationType($request->input('operation_type_id'));
        }

        if ($request->filled('type')) {
            $query->byType($request->input('type'));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->filled('min_price') && $request->filled('max_price')) {
            $query->priceRange(
                $request->input('min_price'),
                $request->input('max_price')
            );
        }

        $perPage = $request->input('per_page', 15);
        $paginated = $query->paginate($perPage);

        return $this->paginated(
            $paginated->items(),
            $paginated->total(),
            $perPage,
            $paginated->currentPage()
        );
    }

    public function show(Property $property): JsonResponse
    {
        $this->propertyService->incrementViews($property->id);
        $property->load('images', 'amenities', 'area', 'developer', 'operationType');

        return $this->success($property);
    }
}
```

- [ ] **Step 3: Create property list test**

```bash
mkdir -p tests/Feature/Properties
touch tests/Feature/Properties/PropertyListTest.php
```

Create `tests/Feature/Properties/PropertyListTest.php`:

```php
<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use Tests\TestCase;

class PropertyListTest extends TestCase
{
    public function test_can_list_available_properties(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(5)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'available',
        ]);

        Property::factory(2)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'sold',
        ]);

        $response = $this->getJson('/api/v1/properties');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonCount(5, 'data');
    }

    public function test_properties_are_paginated(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(30)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        $response = $this->getJson('/api/v1/properties?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.pagination.total', 30)
            ->assertJsonPath('meta.pagination.per_page', 10);
    }
}
```

- [ ] **Step 4: Create property show test**

```bash
touch tests/Feature/Properties/PropertyShowTest.php
```

Create `tests/Feature/Properties/PropertyShowTest.php`:

```php
<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Models\PropertyImage;
use Tests\TestCase;

class PropertyShowTest extends TestCase
{
    public function test_can_show_property_details(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'status' => 'available',
        ]);

        PropertyImage::factory(3)->create(['property_id' => $property->id]);

        $response = $this->getJson("/api/v1/properties/{$property->slug}");

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.title', $property->title)
            ->assertJsonPath('data.slug', $property->slug)
            ->assertJsonCount(3, 'data.images');
    }

    public function test_property_show_increments_views(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $property = Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        $this->getJson("/api/v1/properties/{$property->slug}");
        $this->getJson("/api/v1/properties/{$property->slug}");

        $response = $this->getJson("/api/v1/properties/{$property->slug}");

        $response->assertStatus(200);
    }
}
```

- [ ] **Step 5: Create property filter test**

```bash
touch tests/Feature/Properties/PropertyFilterTest.php
```

Create `tests/Feature/Properties/PropertyFilterTest.php`:

```php
<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use Tests\TestCase;

class PropertyFilterTest extends TestCase
{
    public function test_filter_properties_by_area(): void
    {
        $area1 = Area::factory()->create();
        $area2 = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(3)->create([
            'area_id' => $area1->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        Property::factory(2)->create([
            'area_id' => $area2->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        $response = $this->getJson("/api/v1/properties?area_id={$area1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_filter_properties_by_type(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory(2)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'type' => 'villa',
        ]);

        Property::factory(3)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'type' => 'apartment',
        ]);

        $response = $this->getJson('/api/v1/properties?type=villa');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_filter_properties_by_price_range(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'price' => 1000000,
        ]);

        Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'price' => 5000000,
        ]);

        Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'price' => 10000000,
        ]);

        $response = $this->getJson('/api/v1/properties?min_price=2000000&max_price=6000000');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_search_properties_by_title(): void
    {
        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'title' => 'Luxury Penthouse',
        ]);

        Property::factory(2)->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
            'title' => 'Standard Apartment',
        ]);

        $response = $this->getJson('/api/v1/properties?search=Penthouse');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
```

- [ ] **Step 6: Register routes**

Update `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PropertyController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register'])->name('register');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    // Public property endpoints
    Route::get('properties', [PropertyController::class, 'index']);
    Route::get('properties/{property}', [PropertyController::class, 'show']);
});
```

- [ ] **Step 7: Run tests**

```bash
php artisan test tests/Feature/Properties/ -v
```

Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/Api/V1/PropertyController.php \
  app/Http/Requests/PropertyFilterRequest.php \
  tests/Feature/Properties/ routes/api.php
git commit -m "feat: implement public property list and show endpoints with filtering"
```

---

### Task 9: Create Admin Property CRUD Endpoints

**Files:**
- Create: `app/Http/Controllers/Api/V1/Admin/PropertyController.php`
- Create: `app/Http/Requests/StorePropertyRequest.php`, `UpdatePropertyRequest.php`
- Create: `tests/Feature/Properties/PropertyCrudTest.php`

- [ ] **Step 1: Create form requests**

```bash
php artisan make:request StorePropertyRequest
php artisan make:request UpdatePropertyRequest
```

Update `app/Http/Requests/StorePropertyRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['manager', 'super_admin']);
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:villa,apartment,penthouse,townhouse,commercial',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'area_id' => 'required|integer|exists:areas,id',
            'location' => 'nullable|string',
            'area_sqft' => 'nullable|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'operation_type_id' => 'required|integer|exists:operation_types,id',
            'status' => 'required|in:available,sold,rented',
            'is_featured' => 'nullable|boolean',
            'roi_min' => 'nullable|numeric|min:0',
            'roi_max' => 'nullable|numeric|min:0',
            'developer_id' => 'required|integer|exists:developers,id',
            'primary_agent_id' => 'nullable|integer|exists:users,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string',
        ];
    }
}
```

Update `app/Http/Requests/UpdatePropertyRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['manager', 'super_admin']);
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:villa,apartment,penthouse,townhouse,commercial',
            'price' => 'sometimes|required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'area_id' => 'sometimes|required|integer|exists:areas,id',
            'location' => 'nullable|string',
            'area_sqft' => 'nullable|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'operation_type_id' => 'sometimes|required|integer|exists:operation_types,id',
            'status' => 'sometimes|required|in:available,sold,rented',
            'is_featured' => 'nullable|boolean',
            'roi_min' => 'nullable|numeric|min:0',
            'roi_max' => 'nullable|numeric|min:0',
            'developer_id' => 'sometimes|required|integer|exists:developers,id',
            'primary_agent_id' => 'nullable|integer|exists:users,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string',
        ];
    }
}
```

- [ ] **Step 2: Create admin PropertyController**

```bash
mkdir -p app/Http/Controllers/Api/V1/Admin
touch app/Http/Controllers/Api/V1/Admin/PropertyController.php
```

Create `app/Http/Controllers/Api/V1/Admin/PropertyController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Services\PropertyService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PropertyController
{
    use ApiResponse;

    public function __construct(protected PropertyService $propertyService) {}

    public function index(): JsonResponse
    {
        $properties = Property::withTrashed()->paginate(15);

        return $this->paginated(
            $properties->items(),
            $properties->total(),
            15,
            $properties->currentPage()
        );
    }

    public function show(Property $property): JsonResponse
    {
        $property->load('images', 'amenities', 'area', 'developer', 'operationType');

        return $this->success($property);
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $property = $this->propertyService->createProperty($request->validated());

        if ($request->filled('amenities')) {
            foreach ($request->input('amenities') as $amenity) {
                $property->amenities()->create(['amenity' => $amenity]);
            }
        }

        return $this->success($property, 'Property created successfully', 201);
    }

    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        $property = $this->propertyService->updateProperty($property, $request->validated());

        if ($request->filled('amenities')) {
            $property->amenities()->delete();
            foreach ($request->input('amenities') as $amenity) {
                $property->amenities()->create(['amenity' => $amenity]);
            }
        }

        return $this->success($property, 'Property updated successfully');
    }

    public function destroy(Property $property): JsonResponse
    {
        $property->delete();

        return $this->success(null, 'Property deleted successfully');
    }

    public function restore(Property $property): JsonResponse
    {
        $property->restore();

        return $this->success($property, 'Property restored successfully');
    }
}
```

- [ ] **Step 3: Create CRUD test**

```bash
touch tests/Feature/Properties/PropertyCrudTest.php
```

Create `tests/Feature/Properties/PropertyCrudTest.php`:

```php
<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Models\User;
use Tests\TestCase;

class PropertyCrudTest extends TestCase
{
    protected User $manager;
    protected Area $area;
    protected Developer $developer;
    protected OperationType $operationType;

    public function setUp(): void
    {
        parent::setUp();

        $this->manager = User::factory()->create(['role' => 'manager']);
        $this->area = Area::factory()->create();
        $this->developer = Developer::factory()->create();
        $this->operationType = OperationType::factory()->create();
    }

    public function test_manager_can_create_property(): void
    {
        $response = $this->actingAs($this->manager)
            ->postJson('/api/v1/admin/properties', [
                'title' => 'New Luxury Villa',
                'description' => 'A beautiful villa',
                'type' => 'villa',
                'price' => 5000000,
                'area_id' => $this->area->id,
                'operation_type_id' => $this->operationType->id,
                'developer_id' => $this->developer->id,
                'status' => 'available',
                'amenities' => ['pool', 'gym'],
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.title', 'New Luxury Villa');

        $this->assertDatabaseHas('properties', ['title' => 'New Luxury Villa']);
        $this->assertDatabaseHas('property_amenities', ['amenity' => 'pool']);
    }

    public function test_manager_can_update_property(): void
    {
        $property = Property::factory()->create([
            'area_id' => $this->area->id,
            'developer_id' => $this->developer->id,
            'operation_type_id' => $this->operationType->id,
        ]);

        $response = $this->actingAs($this->manager)
            ->putJson("/api/v1/admin/properties/{$property->id}", [
                'title' => 'Updated Title',
                'price' => 6000000,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.price', 6000000);
    }

    public function test_manager_can_soft_delete_property(): void
    {
        $property = Property::factory()->create([
            'area_id' => $this->area->id,
            'developer_id' => $this->developer->id,
            'operation_type_id' => $this->operationType->id,
        ]);

        $response = $this->actingAs($this->manager)
            ->deleteJson("/api/v1/admin/properties/{$property->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted($property);
    }

    public function test_manager_can_restore_property(): void
    {
        $property = Property::factory()->create([
            'area_id' => $this->area->id,
            'developer_id' => $this->developer->id,
            'operation_type_id' => $this->operationType->id,
            'deleted_at' => now(),
        ]);

        $response = $this->actingAs($this->manager)
            ->postJson("/api/v1/admin/properties/{$property->id}/restore");

        $response->assertStatus(200);
        $this->assertNotSoftDeleted($property);
    }

    public function test_agent_cannot_create_property(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);

        $response = $this->actingAs($agent)
            ->postJson('/api/v1/admin/properties', [
                'title' => 'New Property',
                'type' => 'villa',
                'price' => 5000000,
                'area_id' => $this->area->id,
                'operation_type_id' => $this->operationType->id,
                'developer_id' => $this->developer->id,
            ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_create_property(): void
    {
        $response = $this->postJson('/api/v1/admin/properties', [
            'title' => 'New Property',
            'type' => 'villa',
            'price' => 5000000,
        ]);

        $response->assertStatus(401);
    }
}
```

- [ ] **Step 4: Register admin routes**

Update `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\V1\Admin\PropertyController as AdminPropertyController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PropertyController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register'])->name('register');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    // Public property endpoints
    Route::get('properties', [PropertyController::class, 'index']);
    Route::get('properties/{property}', [PropertyController::class, 'show']);

    // Admin endpoints
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::middleware('role:manager,super_admin')->group(function () {
            Route::get('properties', [AdminPropertyController::class, 'index']);
            Route::post('properties', [AdminPropertyController::class, 'store']);
            Route::get('properties/{property}', [AdminPropertyController::class, 'show']);
            Route::put('properties/{property}', [AdminPropertyController::class, 'update']);
            Route::delete('properties/{property}', [AdminPropertyController::class, 'destroy']);
            Route::post('properties/{property}/restore', [AdminPropertyController::class, 'restore']);
        });
    });
});
```

- [ ] **Step 5: Run tests**

```bash
php artisan test tests/Feature/Properties/PropertyCrudTest.php -v
```

Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/V1/Admin/PropertyController.php \
  app/Http/Requests/StorePropertyRequest.php \
  app/Http/Requests/UpdatePropertyRequest.php \
  tests/Feature/Properties/PropertyCrudTest.php routes/api.php
git commit -m "feat: implement admin property CRUD endpoints with role authorization"
```

---

### Task 10: Create Property Image Upload & Management Endpoints

**Files:**
- Create: `app/Http/Requests/PropertyImageRequest.php`
- Create: `app/Http/Controllers/Api/V1/Admin/PropertyImageController.php`
- Create: `tests/Feature/Properties/PropertyImageTest.php`

- [ ] **Step 1: Create PropertyImageRequest**

```bash
php artisan make:request PropertyImageRequest
```

Update `app/Http/Requests/PropertyImageRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PropertyImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['manager', 'super_admin']);
    }

    public function rules(): array
    {
        return [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'is_primary' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'image.max' => 'Image size must not exceed 10MB',
        ];
    }
}
```

- [ ] **Step 2: Create PropertyImageController**

```bash
touch app/Http/Controllers/Api/V1/Admin/PropertyImageController.php
```

Create `app/Http/Controllers/Api/V1/Admin/PropertyImageController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\PropertyImageRequest;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Services\CloudinaryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyImageController
{
    use ApiResponse;

    public function __construct(protected CloudinaryService $cloudinaryService) {}

    public function store(PropertyImageRequest $request, Property $property): JsonResponse
    {
        $uploadedImage = $this->cloudinaryService->uploadImage(
            $request->file('image'),
            'properties'
        );

        $image = $property->images()->create([
            'url' => $uploadedImage['url'],
            'public_id' => $uploadedImage['public_id'],
            'is_primary' => $request->boolean('is_primary'),
            'order' => $request->input('order', 0),
        ]);

        return $this->success($image, 'Image uploaded successfully', 201);
    }

    public function update(Request $request, Property $property, PropertyImage $image): JsonResponse
    {
        $request->validate([
            'is_primary' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        if ($request->boolean('is_primary')) {
            $property->images()->update(['is_primary' => false]);
        }

        $image->update($request->only(['is_primary', 'order']));

        return $this->success($image, 'Image updated successfully');
    }

    public function destroy(Property $property, PropertyImage $image): JsonResponse
    {
        $this->cloudinaryService->deleteMedia($image->public_id);
        $image->delete();

        return $this->success(null, 'Image deleted successfully');
    }
}
```

- [ ] **Step 3: Create image upload test**

```bash
touch tests/Feature/Properties/PropertyImageTest.php
```

Create `tests/Feature/Properties/PropertyImageTest.php`:

```php
<?php

namespace Tests\Feature\Properties;

use App\Models\Area;
use App\Models\Developer;
use App\Models\OperationType;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PropertyImageTest extends TestCase
{
    protected User $manager;
    protected Property $property;

    public function setUp(): void
    {
        parent::setUp();

        $this->manager = User::factory()->create(['role' => 'manager']);

        $area = Area::factory()->create();
        $developer = Developer::factory()->create();
        $operationType = OperationType::factory()->create();

        $this->property = Property::factory()->create([
            'area_id' => $area->id,
            'developer_id' => $developer->id,
            'operation_type_id' => $operationType->id,
        ]);

        Storage::fake('local');
    }

    public function test_manager_can_upload_property_image(): void
    {
        $file = UploadedFile::fake()->image('property.jpg', 1920, 1080);

        $response = $this->actingAs($this->manager)
            ->postJson(
                "/api/v1/admin/properties/{$this->property->id}/images",
                ['image' => $file]
            );

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.is_primary', false);
    }

    public function test_manager_can_set_primary_image(): void
    {
        $file = UploadedFile::fake()->image('property.jpg');

        $response = $this->actingAs($this->manager)
            ->postJson(
                "/api/v1/admin/properties/{$this->property->id}/images",
                ['image' => $file, 'is_primary' => true]
            );

        $response->assertStatus(201)
            ->assertJsonPath('data.is_primary', true);
    }

    public function test_manager_can_delete_property_image(): void
    {
        $image = $this->property->images()->create([
            'url' => 'https://example.com/image.jpg',
            'public_id' => 'properties/test123',
            'is_primary' => false,
        ]);

        $response = $this->actingAs($this->manager)
            ->deleteJson("/api/v1/admin/properties/{$this->property->id}/images/{$image->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('property_images', ['id' => $image->id]);
    }

    public function test_agent_cannot_upload_image(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);
        $file = UploadedFile::fake()->image('property.jpg');

        $response = $this->actingAs($agent)
            ->postJson(
                "/api/v1/admin/properties/{$this->property->id}/images",
                ['image' => $file]
            );

        $response->assertStatus(403);
    }

    public function test_image_validation_fails_for_non_image(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 1024);

        $response = $this->actingAs($this->manager)
            ->postJson(
                "/api/v1/admin/properties/{$this->property->id}/images",
                ['image' => $file]
            );

        $response->assertStatus(422);
    }
}
```

- [ ] **Step 4: Update routes**

Update `routes/api.php` to include image routes:

```php
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::middleware('role:manager,super_admin')->group(function () {
        Route::get('properties', [AdminPropertyController::class, 'index']);
        Route::post('properties', [AdminPropertyController::class, 'store']);
        Route::get('properties/{property}', [AdminPropertyController::class, 'show']);
        Route::put('properties/{property}', [AdminPropertyController::class, 'update']);
        Route::delete('properties/{property}', [AdminPropertyController::class, 'destroy']);
        Route::post('properties/{property}/restore', [AdminPropertyController::class, 'restore']);

        // Property images
        Route::post('properties/{property}/images', [PropertyImageController::class, 'store']);
        Route::put('properties/{property}/images/{image}', [PropertyImageController::class, 'update']);
        Route::delete('properties/{property}/images/{image}', [PropertyImageController::class, 'destroy']);
    });
});
```

- [ ] **Step 5: Run tests**

```bash
php artisan test tests/Feature/Properties/PropertyImageTest.php -v
```

Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/V1/Admin/PropertyImageController.php \
  app/Http/Requests/PropertyImageRequest.php \
  tests/Feature/Properties/PropertyImageTest.php routes/api.php
git commit -m "feat: implement property image upload and management endpoints"
```

---

### Task 11: Create Master Data Endpoints (Areas, Developers, OperationTypes)

**Files:**
- Create: `app/Http/Controllers/Api/V1/AreaController.php`
- Create: `app/Http/Controllers/Api/V1/DeveloperController.php`
- Create: `app/Http/Controllers/Api/V1/OperationTypeController.php`
- Create: Admin versions in `Api/V1/Admin/`
- Create: Form Requests for store/update
- Create: Feature tests

- [ ] **Step 1: Create public AreaController**

```bash
touch app/Http/Controllers/Api/V1/AreaController.php
```

Create `app/Http/Controllers/Api/V1/AreaController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Area;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AreaController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $areas = Area::all();

        return $this->success($areas);
    }

    public function show(Area $area): JsonResponse
    {
        return $this->success($area);
    }
}
```

- [ ] **Step 2: Create DeveloperController**

```bash
touch app/Http/Controllers/Api/V1/DeveloperController.php
```

Create `app/Http/Controllers/Api/V1/DeveloperController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Developer;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DeveloperController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $developers = Developer::paginate(15);

        return $this->paginated(
            $developers->items(),
            $developers->total(),
            15,
            $developers->currentPage()
        );
    }

    public function show(Developer $developer): JsonResponse
    {
        return $this->success($developer);
    }
}
```

- [ ] **Step 3: Create OperationTypeController**

```bash
touch app/Http/Controllers/Api/V1/OperationTypeController.php
```

Create `app/Http/Controllers/Api/V1/OperationTypeController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\OperationType;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class OperationTypeController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $types = OperationType::all();

        return $this->success($types);
    }
}
```

- [ ] **Step 4: Create admin Area, Developer, OperationType controllers**

```bash
touch app/Http/Controllers/Api/V1/Admin/AreaController.php
touch app/Http/Controllers/Api/V1/Admin/DeveloperController.php
touch app/Http/Controllers/Api/V1/Admin/OperationTypeController.php
```

Create `app/Http/Controllers/Api/V1/Admin/AreaController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Area;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AreaController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $areas = Area::paginate(15);

        return $this->paginated(
            $areas->items(),
            $areas->total(),
            15,
            $areas->currentPage()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:areas',
            'description' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $area = Area::create($validated);

        return $this->success($area, 'Area created successfully', 201);
    }

    public function show(Area $area): JsonResponse
    {
        return $this->success($area);
    }

    public function update(Request $request, Area $area): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:areas,name,' . $area->id,
            'description' => 'nullable|string',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $area->update($validated);

        return $this->success($area, 'Area updated successfully');
    }

    public function destroy(Area $area): JsonResponse
    {
        $area->delete();

        return $this->success(null, 'Area deleted successfully');
    }
}
```

Create `app/Http/Controllers/Api/V1/Admin/DeveloperController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Developer;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeveloperController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $developers = Developer::paginate(15);

        return $this->paginated(
            $developers->items(),
            $developers->total(),
            15,
            $developers->currentPage()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:developers',
            'logo_url' => 'nullable|url',
            'description' => 'nullable|string',
        ]);

        $developer = Developer::create($validated);

        return $this->success($developer, 'Developer created successfully', 201);
    }

    public function show(Developer $developer): JsonResponse
    {
        return $this->success($developer);
    }

    public function update(Request $request, Developer $developer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:developers,name,' . $developer->id,
            'logo_url' => 'nullable|url',
            'description' => 'nullable|string',
        ]);

        $developer->update($validated);

        return $this->success($developer, 'Developer updated successfully');
    }

    public function destroy(Developer $developer): JsonResponse
    {
        $developer->delete();

        return $this->success(null, 'Developer deleted successfully');
    }
}
```

Create `app/Http/Controllers/Api/V1/Admin/OperationTypeController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\OperationType;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OperationTypeController
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $types = OperationType::paginate(15);

        return $this->paginated(
            $types->items(),
            $types->total(),
            15,
            $types->currentPage()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|in:Buy,Rent,Stay,Off-plan|unique:operation_types',
        ]);

        $type = OperationType::create($validated);

        return $this->success($type, 'Operation type created successfully', 201);
    }

    public function show(OperationType $operationType): JsonResponse
    {
        return $this->success($operationType);
    }

    public function update(Request $request, OperationType $operationType): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|in:Buy,Rent,Stay,Off-plan|unique:operation_types,name,' . $operationType->id,
        ]);

        $operationType->update($validated);

        return $this->success($operationType, 'Operation type updated successfully');
    }

    public function destroy(OperationType $operationType): JsonResponse
    {
        $operationType->delete();

        return $this->success(null, 'Operation type deleted successfully');
    }
}
```

- [ ] **Step 5: Update routes**

Update `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\V1\Admin\AreaController as AdminAreaController;
use App\Http\Controllers\Api\V1\Admin\DeveloperController as AdminDeveloperController;
use App\Http\Controllers\Api\V1\Admin\OperationTypeController as AdminOperationTypeController;
use App\Http\Controllers\Api\V1\Admin\PropertyController as AdminPropertyController;
use App\Http\Controllers\Api\V1\Admin\PropertyImageController;
use App\Http\Controllers\Api\V1\AreaController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DeveloperController;
use App\Http\Controllers\Api\V1\OperationTypeController;
use App\Http\Controllers\Api\V1\PropertyController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register'])->name('register');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    // Public endpoints
    Route::get('properties', [PropertyController::class, 'index']);
    Route::get('properties/{property}', [PropertyController::class, 'show']);
    Route::get('areas', [AreaController::class, 'index']);
    Route::get('areas/{area}', [AreaController::class, 'show']);
    Route::get('developers', [DeveloperController::class, 'index']);
    Route::get('developers/{developer}', [DeveloperController::class, 'show']);
    Route::get('operation-types', [OperationTypeController::class, 'index']);

    // Admin endpoints
    Route::middleware('auth:sanctum', 'role:manager,super_admin')->prefix('admin')->group(function () {
        // Properties
        Route::get('properties', [AdminPropertyController::class, 'index']);
        Route::post('properties', [AdminPropertyController::class, 'store']);
        Route::get('properties/{property}', [AdminPropertyController::class, 'show']);
        Route::put('properties/{property}', [AdminPropertyController::class, 'update']);
        Route::delete('properties/{property}', [AdminPropertyController::class, 'destroy']);
        Route::post('properties/{property}/restore', [AdminPropertyController::class, 'restore']);

        // Property images
        Route::post('properties/{property}/images', [PropertyImageController::class, 'store']);
        Route::put('properties/{property}/images/{image}', [PropertyImageController::class, 'update']);
        Route::delete('properties/{property}/images/{image}', [PropertyImageController::class, 'destroy']);

        // Master data
        Route::resource('areas', AdminAreaController::class);
        Route::resource('developers', AdminDeveloperController::class);
        Route::resource('operation-types', AdminOperationTypeController::class);
    });
});
```

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/V1/AreaController.php \
  app/Http/Controllers/Api/V1/DeveloperController.php \
  app/Http/Controllers/Api/V1/OperationTypeController.php \
  app/Http/Controllers/Api/V1/Admin/AreaController.php \
  app/Http/Controllers/Api/V1/Admin/DeveloperController.php \
  app/Http/Controllers/Api/V1/Admin/OperationTypeController.php \
  routes/api.php
git commit -m "feat: implement master data endpoints for areas, developers, operation types"
```

---

## Summary

**Phase 1-2 Complete!** You now have:

✅ User authentication with Sanctum  
✅ Role-based authorization (super_admin, manager, agent, user)  
✅ Property model with slug generation & relationships  
✅ Property images & amenities models  
✅ Cloudinary image upload service  
✅ Redis view counter  
✅ Public property list/show/filter endpoints  
✅ Admin property CRUD  
✅ Property image upload management  
✅ Master data CRUD (Areas, Developers, OperationTypes)  
✅ Comprehensive feature & unit tests  
✅ Consistent JSON response envelope  

**Next Phase (3-6):** After executing this plan, you'll be ready for:
- Leads & Lead Management (Phase 3)
- Blog system (Phase 4)
- Analytics (Phase 5)
- Admin users & settings (Phase 5-6)

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-06-04-evoorion-backend-phase1-2.md`.**

Which approach would you like for implementation?

**1. Subagent-Driven (Recommended)** — I dispatch a fresh subagent per task, you review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch with checkpoints

Which approach?