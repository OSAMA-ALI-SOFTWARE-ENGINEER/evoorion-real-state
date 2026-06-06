# EVOORION Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Laravel 11 REST API for a luxury Dubai real estate platform with role-based access control, Cloudinary integration, and comprehensive test coverage.

**Architecture:** Modular services layer with Eloquent ORM, Sanctum token auth, Redis caching/queues, role-based middleware, consistent JSON envelope responses.

**Tech Stack:** Laravel 11, MySQL, Redis, Eloquent, Sanctum, Cloudinary, PHPUnit (SQLite testing), l5-swagger

---

## Phase 1: Foundation (Days 1-2)

### Task 1: Project Setup & Base Configuration

**Files:**
- Create: `routes/api.php` (API routes)
- Create: `app/Http/Middleware/RoleMiddleware.php`
- Modify: `.env` (environment template)
- Create: `app/Helpers/ResponseHelper.php`

- [ ] **Step 1: Create ResponseHelper with consistent envelope**

```php
// app/Helpers/ResponseHelper.php
<?php

namespace App\Helpers;

class ResponseHelper
{
    public static function success($data = null, $message = 'Operation successful', $statusCode = 200, $meta = [])
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => $meta,
        ], $statusCode);
    }

    public static function error($message = 'An error occurred', $statusCode = 400, $errors = [], $data = null)
    {
        return response()->json([
            'success' => false,
            'data' => $data,
            'message' => $message,
            'meta' => empty($errors) ? [] : ['errors' => $errors],
        ], $statusCode);
    }

    public static function paginated($items, $message = 'Operation successful')
    {
        return [
            'success' => true,
            'data' => $items->items(),
            'message' => $message,
            'meta' => [
                'pagination' => [
                    'current_page' => $items->currentPage(),
                    'total' => $items->total(),
                    'per_page' => $items->perPage(),
                    'last_page' => $items->lastPage(),
                ],
            ],
        ];
    }
}
```

- [ ] **Step 2: Create RoleMiddleware for authorization**

```php
// app/Http/Middleware/RoleMiddleware.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Helpers\ResponseHelper;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        
        if (!$user || !in_array($user->role, $roles)) {
            return ResponseHelper::error('Unauthorized', 403);
        }

        return $next($request);
    }
}
```

- [ ] **Step 3: Register ResponseHelper and middleware in app/Providers/AppServiceProvider.php**

Add to AppServiceProvider boot():
```php
$this->app->make('Illuminate\Routing\Router')->aliasMiddleware(
    'role', \App\Http\Middleware\RoleMiddleware::class
);
```

- [ ] **Step 4: Update .env with required variables**

```env
APP_NAME="EVOORION"
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=evoorion
DB_USERNAME=root
DB_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_FROM_ADDRESS=noreply@evoorion.com
MAIL_FROM_NAME="EVOORION"

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

- [ ] **Step 5: Commit**

```bash
git add app/Helpers/ResponseHelper.php app/Http/Middleware/RoleMiddleware.php app/Providers/AppServiceProvider.php .env.example
git commit -m "feat: add response helper and role middleware"
```

---

### Task 2: Database Migrations - Users & Core Tables

**Files:**
- Create: `database/migrations/2026_06_04_000001_create_users_table.php`
- Create: `database/migrations/2026_06_04_000002_create_areas_table.php`
- Create: `database/migrations/2026_06_04_000003_create_developers_table.php`
- Create: `database/migrations/2026_06_04_000004_create_operation_types_table.php`

- [ ] **Step 1: Create users migration**

```php
// database/migrations/2026_06_04_000001_create_users_table.php
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
            $table->enum('role', ['super_admin', 'manager', 'agent'])->default('agent');
            $table->timestamp('last_login_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

- [ ] **Step 2: Create areas migration**

```php
// database/migrations/2026_06_04_000002_create_areas_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
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

- [ ] **Step 3: Create developers migration**

```php
// database/migrations/2026_06_04_000003_create_developers_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('developers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
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

- [ ] **Step 4: Create operation_types migration**

```php
// database/migrations/2026_06_04_000004_create_operation_types_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('operation_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operation_types');
    }
};
```

- [ ] **Step 5: Run migrations**

```bash
php artisan migrate
```

- [ ] **Step 6: Commit**

```bash
git add database/migrations
git commit -m "feat: create base schema migrations for users, areas, developers, operation_types"
```

---

### Task 3: Database Migrations - Properties & Related Tables

**Files:**
- Create: `database/migrations/2026_06_04_000005_create_properties_table.php`
- Create: `database/migrations/2026_06_04_000006_create_property_images_table.php`
- Create: `database/migrations/2026_06_04_000007_create_property_amenities_table.php`
- Create: `database/migrations/2026_06_04_000008_create_property_agent_assignments_table.php`

- [ ] **Step 1: Create properties migration**

```php
// database/migrations/2026_06_04_000005_create_properties_table.php
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
            $table->text('description');
            $table->enum('type', ['villa', 'apartment', 'penthouse', 'townhouse', 'commercial']);
            $table->decimal('price', 15, 2);
            $table->string('currency')->default('AED');
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
            $table->foreignId('developer_id')->nullable()->constrained();
            $table->foreignId('primary_agent_id')->nullable()->constrained('users');
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->bigInteger('views_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index('area_id');
            $table->index('developer_id');
            $table->index('operation_type_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
```

- [ ] **Step 2: Create property_images migration**

```php
// database/migrations/2026_06_04_000006_create_property_images_table.php
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
            $table->string('public_id');
            $table->boolean('is_primary')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('property_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_images');
    }
};
```

- [ ] **Step 3: Create property_amenities migration**

```php
// database/migrations/2026_06_04_000007_create_property_amenities_table.php
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

            $table->index('property_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_amenities');
    }
};
```

- [ ] **Step 4: Create property_agent_assignments migration**

```php
// database/migrations/2026_06_04_000008_create_property_agent_assignments_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('property_agent_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('assigned_at');
            $table->timestamps();

            $table->unique(['property_id', 'agent_id']);
            $table->index('agent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_agent_assignments');
    }
};
```

- [ ] **Step 5: Run migrations**

```bash
php artisan migrate
```

- [ ] **Step 6: Commit**

```bash
git add database/migrations/2026_06_04_000005* database/migrations/2026_06_04_000006* database/migrations/2026_06_04_000007* database/migrations/2026_06_04_000008*
git commit -m "feat: create properties and property-related schema migrations"
```

---

### Task 4: Database Migrations - Leads, Blog, & Content Tables

**Files:**
- Create: `database/migrations/2026_06_04_000009_create_leads_table.php`
- Create: `database/migrations/2026_06_04_000010_create_lead_notes_table.php`
- Create: `database/migrations/2026_06_04_000011_create_blog_posts_table.php`
- Create: `database/migrations/2026_06_04_000012_create_blog_tags_table.php`
- Create: `database/migrations/2026_06_04_000013_create_blog_post_tags_table.php`

- [ ] **Step 1: Create leads migration**

```php
// database/migrations/2026_06_04_000009_create_leads_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->foreignId('property_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('budget_min', 15, 2)->nullable();
            $table->decimal('budget_max', 15, 2)->nullable();
            $table->text('message')->nullable();
            $table->enum('source', ['website', 'instagram', 'facebook', 'whatsapp', 'referral', 'other'])->default('website');
            $table->enum('status', ['new', 'contacted', 'qualified', 'closed', 'lost'])->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
            $table->index('source');
            $table->index('assigned_to');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
```

- [ ] **Step 2: Create lead_notes migration**

```php
// database/migrations/2026_06_04_000010_create_lead_notes_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lead_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('note');
            $table->timestamps();

            $table->index('lead_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_notes');
    }
};
```

- [ ] **Step 3: Create blog_posts migration**

```php
// database/migrations/2026_06_04_000011_create_blog_posts_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('excerpt');
            $table->longText('content');
            $table->string('featured_image')->nullable();
            $table->foreignId('author_id')->constrained('users');
            $table->enum('status', ['draft', 'published', 'scheduled'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->bigInteger('views_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
            $table->index('author_id');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
```

- [ ] **Step 4: Create blog_tags migration**

```php
// database/migrations/2026_06_04_000012_create_blog_tags_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('blog_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_tags');
    }
};
```

- [ ] **Step 5: Create blog_post_tags migration**

```php
// database/migrations/2026_06_04_000013_create_blog_post_tags_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('blog_post_tags', function (Blueprint $table) {
            $table->foreignId('blog_post_id')->constrained()->onDelete('cascade');
            $table->foreignId('blog_tag_id')->constrained()->onDelete('cascade');
            $table->primary(['blog_post_id', 'blog_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_post_tags');
    }
};
```

- [ ] **Step 6: Run migrations**

```bash
php artisan migrate
```

- [ ] **Step 7: Commit**

```bash
git add database/migrations/2026_06_04_000009* database/migrations/2026_06_04_000010* database/migrations/2026_06_04_000011* database/migrations/2026_06_04_000012* database/migrations/2026_06_04_000013*
git commit -m "feat: create leads, blog, and content schema migrations"
```

---

### Task 5: Database Migrations - Settings, Activity, Wishlist Tables

**Files:**
- Create: `database/migrations/2026_06_04_000014_create_media_files_table.php`
- Create: `database/migrations/2026_06_04_000015_create_page_contents_table.php`
- Create: `database/migrations/2026_06_04_000016_create_settings_table.php`
- Create: `database/migrations/2026_06_04_000017_create_wishlists_table.php`
- Create: `database/migrations/2026_06_04_000018_create_user_preferences_table.php`
- Create: `database/migrations/2026_06_04_000019_create_activity_logs_table.php`
- Create: `database/migrations/2026_06_04_000020_create_agencies_table.php`
- Create: `database/migrations/2026_06_04_000021_create_agents_table.php`

- [ ] **Step 1-8: Create all remaining migrations (consolidated)**

Media files migration:
```php
// database/migrations/2026_06_04_000014_create_media_files_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('public_id');
            $table->enum('type', ['image', 'video']);
            $table->string('folder');
            $table->bigInteger('size')->nullable();
            $table->timestamps();
            $table->index('folder');
        });
    }
    public function down(): void { Schema::dropIfExists('media_files'); }
};
```

Page contents:
```php
// database/migrations/2026_06_04_000015_create_page_contents_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('page_contents', function (Blueprint $table) {
            $table->id();
            $table->string('page_slug');
            $table->string('section_key');
            $table->json('content');
            $table->timestamps();
            $table->unique(['page_slug', 'section_key']);
        });
    }
    public function down(): void { Schema::dropIfExists('page_contents'); }
};
```

Settings:
```php
// database/migrations/2026_06_04_000016_create_settings_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('settings'); }
};
```

Wishlists:
```php
// database/migrations/2026_06_04_000017_create_wishlists_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->timestamp('created_at');
            $table->unique(['user_id', 'property_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('wishlists'); }
};
```

User preferences:
```php
// database/migrations/2026_06_04_000018_create_user_preferences_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('currency')->default('AED');
            $table->string('area_unit')->default('SQ.FT');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('user_preferences'); }
};
```

Activity logs:
```php
// database/migrations/2026_06_04_000019_create_activity_logs_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->string('ip_address')->nullable();
            $table->json('changes')->nullable();
            $table->timestamps();
            $table->index(['model_type', 'model_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('activity_logs'); }
};
```

Agencies:
```php
// database/migrations/2026_06_04_000020_create_agencies_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo_url')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('agencies'); }
};
```

Agents:
```php
// database/migrations/2026_06_04_000021_create_agents_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('agency_id')->nullable()->constrained()->onDelete('set null');
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->unique('user_id');
        });
    }
    public function down(): void { Schema::dropIfExists('agents'); }
};
```

- [ ] **Step 9: Run all migrations**

```bash
php artisan migrate
```

- [ ] **Step 10: Commit**

```bash
git add database/migrations/2026_06_04_000014* database/migrations/2026_06_04_000015* database/migrations/2026_06_04_000016* database/migrations/2026_06_04_000017* database/migrations/2026_06_04_000018* database/migrations/2026_06_04_000019* database/migrations/2026_06_04_000020* database/migrations/2026_06_04_000021*
git commit -m "feat: create remaining schema migrations for media, settings, wishlists, activity logs, agencies"
```

---

### Task 6: Create Eloquent Models with Relationships

**Files:**
- Create: `app/Models/User.php` (update existing)
- Create: `app/Models/Property.php`
- Create: `app/Models/PropertyImage.php`
- Create: `app/Models/PropertyAmenity.php`
- Create: `app/Models/Area.php`
- Create: `app/Models/Developer.php`
- Create: `app/Models/OperationType.php`
- Create: `app/Models/Lead.php`
- Create: `app/Models/LeadNote.php`
- Create: `app/Models/BlogPost.php`
- Create: `app/Models/BlogTag.php`
- Create: `app/Models/Wishlist.php`
- Create: `app/Models/Agency.php`
- Create: `app/Models/Agent.php`
- Create: `app/Models/ActivityLog.php`

- [ ] **Step 1: Update User model with relationships**

```php
// app/Models/User.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = ['name', 'email', 'password', 'role', 'is_active'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['is_active' => 'boolean'];

    public function leads(): HasMany { return $this->hasMany(Lead::class, 'assigned_to'); }
    public function blogPosts(): HasMany { return $this->hasMany(BlogPost::class, 'author_id'); }
    public function activityLogs(): HasMany { return $this->hasMany(ActivityLog::class); }
    public function userPreference(): HasOne { return $this->hasOne(UserPreference::class); }
    public function wishlists(): HasMany { return $this->hasMany(Wishlist::class); }
    public function agent(): HasOne { return $this->hasOne(Agent::class); }
}
```

- [ ] **Step 2: Create Property model with scopes**

```php
// app/Models/Property.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Builder;

class Property extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'type', 'price', 'currency',
        'area_id', 'location', 'area_sqft', 'bedrooms', 'bathrooms',
        'operation_type_id', 'status', 'is_featured', 'roi_min', 'roi_max',
        'developer_id', 'primary_agent_id', 'meta_title', 'meta_description'
    ];

    public function developer(): BelongsTo { return $this->belongsTo(Developer::class); }
    public function area(): BelongsTo { return $this->belongsTo(Area::class); }
    public function operationType(): BelongsTo { return $this->belongsTo(OperationType::class); }
    public function primaryAgent(): BelongsTo { return $this->belongsTo(User::class, 'primary_agent_id'); }
    public function images(): HasMany { return $this->hasMany(PropertyImage::class); }
    public function amenities(): HasMany { return $this->hasMany(PropertyAmenity::class); }
    public function agents(): BelongsToMany { return $this->belongsToMany(User::class, 'property_agent_assignments', 'property_id', 'agent_id'); }
    public function wishlists(): HasMany { return $this->hasMany(Wishlist::class); }
    public function interestedUsers(): HasManyThrough { return $this->hasManyThrough(User::class, Wishlist::class, 'property_id', 'id', 'id', 'user_id'); }

    public function scopeFeatured(Builder $query): Builder { return $query->where('is_featured', true); }
    public function scopeAvailable(Builder $query): Builder { return $query->where('status', 'available'); }
    public function scopeByType(Builder $query, $type): Builder { return $query->where('type', $type); }
    public function scopeByOperationType(Builder $query, $type): Builder { return $query->where('operation_type_id', $type); }
    public function scopeByArea(Builder $query, $areaId): Builder { return $query->where('area_id', $areaId); }
    public function scopeByDeveloper(Builder $query, $developerId): Builder { return $query->where('developer_id', $developerId); }
    public function scopeSearch(Builder $query, $search): Builder {
        return $query->where('title', 'like', "%{$search}%")
                     ->orWhere('description', 'like', "%{$search}%");
    }
}
```

- [ ] **Step 3: Create remaining models**

PropertyImage, PropertyAmenity, Area, Developer, OperationType models (simple):
```php
// app/Models/PropertyImage.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyImage extends Model
{
    protected $fillable = ['property_id', 'url', 'public_id', 'is_primary', 'order'];

    public function property(): BelongsTo { return $this->belongsTo(Property::class); }
}
```

```php
// app/Models/PropertyAmenity.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyAmenity extends Model
{
    protected $fillable = ['property_id', 'amenity'];
}
```

```php
// app/Models/Area.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    protected $fillable = ['name', 'slug', 'description'];
}
```

```php
// app/Models/Developer.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Developer extends Model
{
    protected $fillable = ['name', 'logo_url', 'description'];
}
```

```php
// app/Models/OperationType.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationType extends Model
{
    protected $fillable = ['name'];
}
```

- [ ] **Step 4: Create Lead, LeadNote, BlogPost models**

```php
// app/Models/Lead.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Lead extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'email', 'phone', 'whatsapp', 'property_id',
        'budget_min', 'budget_max', 'message', 'source', 'status', 'assigned_to'
    ];

    public function property(): BelongsTo { return $this->belongsTo(Property::class); }
    public function assignedUser(): BelongsTo { return $this->belongsTo(User::class, 'assigned_to'); }
    public function notes(): HasMany { return $this->hasMany(LeadNote::class); }

    public function scopeByStatus(Builder $query, $status): Builder { return $query->where('status', $status); }
    public function scopeByDateRange(Builder $query, $from, $to): Builder {
        return $query->whereBetween('created_at', [$from, $to]);
    }
    public function scopeBySource(Builder $query, $source): Builder { return $query->where('source', $source); }
    public function scopeSearch(Builder $query, $search): Builder {
        return $query->where('name', 'like', "%{$search}%")
                     ->orWhere('email', 'like', "%{$search}%")
                     ->orWhere('phone', 'like', "%{$search}%");
    }
}
```

```php
// app/Models/LeadNote.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadNote extends Model
{
    protected $fillable = ['lead_id', 'user_id', 'note'];

    public function lead(): BelongsTo { return $this->belongsTo(Lead::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
```

```php
// app/Models/BlogPost.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

class BlogPost extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'featured_image',
        'author_id', 'status', 'published_at', 'meta_title', 'meta_description'
    ];

    protected $casts = ['published_at' => 'datetime'];

    public function author(): BelongsTo { return $this->belongsTo(User::class); }
    public function tags(): BelongsToMany { return $this->belongsToMany(BlogTag::class, 'blog_post_tags'); }

    public function scopePublished(Builder $query): Builder { return $query->where('status', 'published'); }
    public function scopeScheduled(Builder $query): Builder { return $query->where('status', 'scheduled'); }
    public function scopeByAuthor(Builder $query, $authorId): Builder { return $query->where('author_id', $authorId); }
}
```

- [ ] **Step 5: Create remaining models (BlogTag, Wishlist, Agency, Agent, ActivityLog)**

```php
// app/Models/BlogTag.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BlogTag extends Model
{
    protected $fillable = ['name', 'slug'];
    public function posts(): BelongsToMany { return $this->belongsToMany(BlogPost::class, 'blog_post_tags'); }
}
```

```php
// app/Models/Wishlist.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    protected $fillable = ['user_id', 'property_id'];
    public $timestamps = false;

    public function user() { return $this->belongsTo(User::class); }
    public function property() { return $this->belongsTo(Property::class); }
}
```

```php
// app/Models/Agency.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    protected $fillable = ['name', 'logo_url', 'contact_email', 'phone', 'address'];
}
```

```php
// app/Models/Agent.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agent extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'agency_id', 'phone', 'whatsapp'];

    public function user() { return $this->belongsTo(User::class); }
    public function agency() { return $this->belongsTo(Agency::class); }
}
```

```php
// app/Models/ActivityLog.php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'action', 'model_type', 'model_id', 'ip_address', 'changes'];
    protected $casts = ['changes' => 'json'];
    public $timestamps = false;

    public function user() { return $this->belongsTo(User::class); }
}
```

- [ ] **Step 6: Commit all models**

```bash
git add app/Models/*.php
git commit -m "feat: create all eloquent models with relationships and scopes"
```

---

**Phase 1 Complete.** Ready to proceed with Phase 2 (Properties)? Use `superpowers:executing-plans` or `superpowers:subagent-driven-development` to continue.
