# EVOORION Backend Implementation Plan: Phases 3-6
**Date:** 2026-06-04  
**Project:** EVOORION — Luxury Dubai Real Estate Platform  
**Phases Covered:** Phase 3 (Leads & Agents), Phase 4 (Blog & Content), Phase 5 (Analytics & Admin), Phase 6 (Polish & Documentation)

---

## EXECUTIVE SUMMARY

This plan details the implementation of 4 consecutive phases (approximately 4 days of development) comprising:
- **Phase 3:** Lead management system with agent assignments and activity logging
- **Phase 4:** Blog publishing, wishlists, user preferences, and CMS
- **Phase 5:** Analytics dashboards, user management, and settings
- **Phase 6:** API documentation, rate limiting, testing coverage, and production polish

**Total Tasks:** 15 major tasks  
**Test Coverage Target:** 80%+ for critical paths  
**Key Deliverables:** 30+ new files, 8 services, 12 controllers, 10 migrations, 15 form requests

---

## PHASE 3: LEADS & AGENTS MANAGEMENT (Days 3-4)

### Overview
Implement a complete lead management system enabling agents and managers to track inquiries, assign them to agents, manage notes, and export lead data. Includes agency/agent master data and comprehensive activity logging.

### Task 3.1: Leads Model & Migration
**File:** `database/migrations/[timestamp]_create_leads_table.php`  
**Model:** `app/Models/Lead.php`

**Migration Structure:**
```php
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
    $table->enum('source', ['website', 'instagram', 'facebook', 'whatsapp', 'referral', 'other']);
    $table->enum('status', ['new', 'contacted', 'qualified', 'closed', 'lost'])->default('new');
    $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
    $table->softDeletes();
    $table->timestamps();
    $table->index(['status', 'created_at']);
    $table->index(['assigned_to']);
});
```

**Model Relationships:**
```php
belongsTo(Property::class, 'property_id')->nullable()
belongsTo(User::class, 'assigned_to')->nullable()
hasMany(LeadNote::class)
```

**Model Scopes:**
```php
scopeByStatus($status) — filters by status enum
scopeByDateRange($from, $to) — filters by created_at range
scopeBySource($source) — filters by source enum
scopeSearch($query) — searches name, email, phone
scopeAssignedToAgent($agentId) — filters by assigned_to
scopeUnassigned() — where assigned_to is null
```

**Commit:** `feat: create leads model, migration, and scopes`

---

### Task 3.2: LeadNotes Model & Migration
**File:** `database/migrations/[timestamp]_create_lead_notes_table.php`  
**Model:** `app/Models/LeadNote.php`

**Migration:**
```php
Schema::create('lead_notes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('lead_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->longText('note');
    $table->timestamps();
    $table->index(['lead_id', 'created_at']);
});
```

**Model Relationships:**
```php
belongsTo(Lead::class)
belongsTo(User::class)
```

**Commit:** `feat: create lead notes model and migration`

---

### Task 3.3: Agencies & Agents Models & Migrations
**Files:** 
- `database/migrations/[timestamp]_create_agencies_table.php`
- `database/migrations/[timestamp]_create_agents_table.php`
- `app/Models/Agency.php`
- `app/Models/Agent.php`

**Agencies Migration:**
```php
Schema::create('agencies', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->string('logo_url')->nullable();
    $table->string('contact_email');
    $table->string('phone');
    $table->string('address');
    $table->timestamps();
});
```

**Agents Migration:**
```php
Schema::create('agents', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
    $table->foreignId('agency_id')->constrained()->onDelete('cascade');
    $table->string('phone');
    $table->string('whatsapp')->nullable();
    $table->softDeletes();
    $table->timestamps();
    $table->index(['agency_id']);
});
```

**Agency Model Relationships:**
```php
hasMany(Agent::class)
hasMany(User::class, 'id', 'user_id')->through('agents')
```

**Agent Model Relationships:**
```php
belongsTo(User::class)
belongsTo(Agency::class)
hasMany(PropertyAgentAssignment::class, 'agent_id')
hasManyThrough(Property::class, 'PropertyAgentAssignment')
```

**Commit:** `feat: create agency and agent models with migrations`

---

### Task 3.4: PropertyAgentAssignment Model & Migration
**File:** `database/migrations/[timestamp]_create_property_agent_assignments_table.php`  
**Model:** `app/Models/PropertyAgentAssignment.php`

**Migration:**
```php
Schema::create('property_agent_assignments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('property_id')->constrained()->onDelete('cascade');
    $table->foreignId('agent_id')->constrained()->onDelete('cascade');
    $table->timestamp('assigned_at')->useCurrent();
    $table->timestamps();
    $table->unique(['property_id', 'agent_id']);
    $table->index(['agent_id']);
});
```

**Model Relationships:**
```php
belongsTo(Property::class)
belongsTo(Agent::class)
```

**Update Property Model:**
```php
belongsToMany(Agent::class, 'property_agent_assignments', 'property_id', 'agent_id')
        ->withPivot('assigned_at')
        ->withTimestamps()
```

**Commit:** `feat: create property agent assignment model`

---

### Task 3.5: LeadService Implementation
**File:** `app/Services/LeadService.php`

**Methods:**

```php
class LeadService {
    /**
     * Create a new lead and queue notification
     */
    public function createLead(array $data): Lead {
        $lead = Lead::create($data);
        NotificationJob::dispatch('lead_created', $lead);
        ActivityLog::log('created', 'Lead', $lead->id, auth()->id(), changes: ['created' => $lead->toArray()]);
        return $lead;
    }

    /**
     * Assign lead to agent with email notification
     */
    public function assignLead(int $leadId, int $agentId): Lead {
        $lead = Lead::findOrFail($leadId);
        $agent = Agent::findOrFail($agentId);
        
        $oldAssignee = $lead->assigned_to;
        $lead->update(['assigned_to' => $agent->user_id]);
        
        LeadAssignedJob::dispatch($lead, $agent);
        ActivityLog::log('updated', 'Lead', $leadId, auth()->id(), [
            'assigned_to' => [$oldAssignee, $agent->user_id]
        ]);
        
        return $lead;
    }

    /**
     * Change lead status with activity logging
     */
    public function changeStatus(int $leadId, string $status): Lead {
        $lead = Lead::findOrFail($leadId);
        $oldStatus = $lead->status;
        
        $lead->update(['status' => $status]);
        ActivityLog::log('updated', 'Lead', $leadId, auth()->id(), [
            'status' => [$oldStatus, $status]
        ]);
        
        if ($status === 'closed' || $status === 'lost') {
            LeadClosedJob::dispatch($lead, $status);
        }
        
        return $lead;
    }

    /**
     * Add note to lead
     */
    public function addNote(int $leadId, string $noteText): LeadNote {
        $note = LeadNote::create([
            'lead_id' => $leadId,
            'user_id' => auth()->id(),
            'note' => $noteText,
        ]);
        
        ActivityLog::log('created', 'LeadNote', $note->id, auth()->id(), ['text' => $noteText]);
        return $note;
    }

    /**
     * Export leads to CSV with filters
     */
    public function exportCSV(array $filters): StreamedResponse {
        $query = Lead::query()
            ->when($filters['status'] ?? null, fn($q, $s) => $q->byStatus($s))
            ->when($filters['date_from'] ?? null, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filters['date_to'] ?? null, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderBy('created_at', 'desc');

        return response()->streamDownload(function () use ($query) {
            $csv = fopen('php://output', 'w');
            fputcsv($csv, ['ID', 'Name', 'Email', 'Phone', 'WhatsApp', 'Status', 'Source', 'Budget Min', 'Budget Max', 'Assigned To', 'Created At']);
            
            $query->chunk(100, function ($leads) use ($csv) {
                foreach ($leads as $lead) {
                    fputcsv($csv, [
                        $lead->id,
                        $lead->name,
                        $lead->email,
                        $lead->phone,
                        $lead->whatsapp,
                        $lead->status,
                        $lead->source,
                        $lead->budget_min,
                        $lead->budget_max,
                        $lead->assignedUser?->name ?? 'Unassigned',
                        $lead->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });
            
            fclose($csv);
        }, 'leads_export_' . now()->format('Y-m-d') . '.csv');
    }
}
```

**Commit:** `feat: implement lead service with assignment, status, notes, and CSV export`

---

### Task 3.6: ActivityLog Model & Migration
**File:** `database/migrations/[timestamp]_create_activity_logs_table.php`  
**Model:** `app/Models/ActivityLog.php`

**Migration:**
```php
Schema::create('activity_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('action'); // created, updated, deleted, restored
    $table->string('model_type');
    $table->unsignedBigInteger('model_id');
    $table->ipAddress('ip_address')->nullable();
    $table->json('changes')->nullable(); // {before: {}, after: {}}
    $table->timestamps();
    $table->index(['model_type', 'model_id']);
    $table->index(['user_id', 'created_at']);
});
```

**Model Methods:**
```php
class ActivityLog {
    public static function log(string $action, string $modelType, int $modelId, ?int $userId, array $changes = []): self {
        return self::create([
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'user_id' => $userId,
            'ip_address' => request()->ip(),
            'changes' => count($changes) > 0 ? $changes : null,
        ]);
    }

    public function belongsTo(User::class);
}
```

**Commit:** `feat: create activity log model and migration`

---

### Task 3.7: Lead CRUD Form Requests & Validation
**Files:**
- `app/Http/Requests/StoreLeadRequest.php`
- `app/Http/Requests/UpdateLeadRequest.php`

**StoreLeadRequest:**
```php
class StoreLeadRequest extends FormRequest {
    public function authorize(): bool {
        return true; // Public submission
    }

    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'property_id' => 'nullable|exists:properties,id',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'message' => 'nullable|string|max:1000',
            'source' => 'required|in:website,instagram,facebook,whatsapp,referral,other',
        ];
    }
}
```

**UpdateLeadRequest:**
```php
class UpdateLeadRequest extends FormRequest {
    public function authorize(): bool {
        return auth()->check() && (auth()->user()->isManager() || auth()->user()->isAgent());
    }

    public function rules(): array {
        return [
            'status' => 'sometimes|in:new,contacted,qualified,closed,lost',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'message' => 'sometimes|string|max:1000',
            'note' => 'sometimes|string|max:2000', // For adding note in same request
        ];
    }
}
```

**Commit:** `feat: create lead form requests with validation rules`

---

### Task 3.8: Lead Controller & Admin Endpoints
**File:** `app/Http/Controllers/LeadController.php`

**Key Methods:**
```php
class LeadController extends Controller {
    public function __construct(private LeadService $leadService) {}

    // POST /api/v1/leads (public)
    public function store(StoreLeadRequest $request): JsonResponse {
        $lead = $this->leadService->createLead($request->validated());
        return response()->json([
            'success' => true,
            'data' => $lead,
            'message' => 'Lead submitted successfully',
        ], 201);
    }

    // GET /api/v1/admin/leads (agent+)
    #[Middleware('role:agent,manager,super_admin')]
    public function index(Request $request): JsonResponse {
        $leads = Lead::query()
            ->when($request->status, fn($q) => $q->byStatus($request->status))
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->date_from, fn($q) => $q->byDateRange($request->date_from, $request->date_to))
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
            'meta' => ['pagination' => $this->paginationMeta($leads)],
        ]);
    }

    // GET /api/v1/admin/leads/{id} (agent+)
    #[Middleware('role:agent,manager,super_admin')]
    public function show(Lead $lead): JsonResponse {
        return response()->json([
            'success' => true,
            'data' => $lead->load('notes', 'assignedUser', 'property'),
        ]);
    }

    // PUT /api/v1/admin/leads/{id} (agent+)
    #[Middleware('role:agent,manager,super_admin')]
    public function update(Lead $lead, UpdateLeadRequest $request): JsonResponse {
        $validated = $request->validated();

        if (isset($validated['status'])) {
            $this->leadService->changeStatus($lead->id, $validated['status']);
        }

        if (isset($validated['assigned_to'])) {
            $this->leadService->assignLead($lead->id, $validated['assigned_to']);
        }

        if (isset($validated['note'])) {
            $this->leadService->addNote($lead->id, $validated['note']);
        }

        $lead = $lead->fresh()->load('notes', 'assignedUser');
        return response()->json(['success' => true, 'data' => $lead]);
    }

    // DELETE /api/v1/admin/leads/{id} (agent+)
    #[Middleware('role:agent,manager,super_admin')]
    public function destroy(Lead $lead): JsonResponse {
        $lead->delete();
        ActivityLog::log('deleted', 'Lead', $lead->id, auth()->id());
        return response()->json(['success' => true, 'message' => 'Lead deleted']);
    }

    // POST /api/v1/admin/leads/{id}/restore (manager+)
    #[Middleware('role:manager,super_admin')]
    public function restore(int $id): JsonResponse {
        $lead = Lead::withTrashed()->findOrFail($id);
        $lead->restore();
        ActivityLog::log('restored', 'Lead', $lead->id, auth()->id());
        return response()->json(['success' => true, 'data' => $lead]);
    }

    // POST /api/v1/admin/leads/{id}/notes (agent+)
    #[Middleware('role:agent,manager,super_admin')]
    public function addNote(Lead $lead, Request $request): JsonResponse {
        $request->validate(['note' => 'required|string|max:2000']);
        $note = $this->leadService->addNote($lead->id, $request->note);
        return response()->json(['success' => true, 'data' => $note], 201);
    }

    // GET /api/v1/admin/leads/{id}/notes (agent+)
    #[Middleware('role:agent,manager,super_admin')]
    public function getNotes(Lead $lead): JsonResponse {
        $notes = $lead->notes()->latest()->paginate(10);
        return response()->json([
            'success' => true,
            'data' => $notes->items(),
            'meta' => ['pagination' => $this->paginationMeta($notes)],
        ]);
    }

    // DELETE /api/v1/admin/leads/{id}/notes/{noteId} (manager+)
    #[Middleware('role:manager,super_admin')]
    public function deleteNote(Lead $lead, LeadNote $note): JsonResponse {
        if ($note->lead_id !== $lead->id) {
            return response()->json(['success' => false, 'message' => 'Note not found'], 404);
        }
        $note->delete();
        ActivityLog::log('deleted', 'LeadNote', $note->id, auth()->id());
        return response()->json(['success' => true]);
    }

    // GET /api/v1/admin/leads/export/csv (manager+)
    #[Middleware('role:manager,super_admin')]
    public function exportCSV(Request $request): StreamedResponse {
        $filters = $request->validate([
            'status' => 'nullable|in:new,contacted,qualified,closed,lost',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);
        return $this->leadService->exportCSV($filters);
    }
}
```

**Routes:**
```php
// routes/api.php
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    Route::get('leads/export/csv', [LeadController::class, 'exportCSV'])->middleware('role:manager,super_admin');
    Route::apiResource('leads', LeadController::class)->middleware('role:agent,manager,super_admin');
    Route::post('leads/{lead}/notes', [LeadController::class, 'addNote'])->middleware('role:agent,manager,super_admin');
    Route::get('leads/{lead}/notes', [LeadController::class, 'getNotes'])->middleware('role:agent,manager,super_admin');
    Route::delete('leads/{lead}/notes/{note}', [LeadController::class, 'deleteNote'])->middleware('role:manager,super_admin');
    Route::post('leads/{lead}/restore', [LeadController::class, 'restore'])->middleware('role:manager,super_admin');
});

Route::post('leads', [LeadController::class, 'store']); // Public
```

**Commit:** `feat: implement lead controller with CRUD, notes, CSV export endpoints`

---

### Task 3.9: Agency & Agent CRUD Endpoints
**Files:**
- `app/Http/Controllers/AgencyController.php`
- `app/Http/Controllers/AgentController.php`
- `app/Http/Requests/StoreAgencyRequest.php`
- `app/Http/Requests/StoreAgentRequest.php`

**Key Implementation:**
- GET/POST/PUT/DELETE endpoints for agencies (manager+ only)
- GET/POST/PUT/DELETE endpoints for agents (manager+ only)
- Form request validation with unique name constraints
- Activity logging on all mutations

**Commit:** `feat: implement agency and agent CRUD endpoints`

---

### Task 3.10: Property Agent Assignment Endpoint
**File:** `app/Http/Controllers/PropertyAgentAssignmentController.php`

**Endpoints:**
```php
// POST /api/v1/admin/properties/{property}/agents
public function assign(Property $property, Request $request): JsonResponse {
    $request->validate(['agent_id' => 'required|exists:agents,id']);
    
    $property->agents()->attach($request->agent_id, ['assigned_at' => now()]);
    ActivityLog::log('created', 'PropertyAgentAssignment', $property->id, auth()->id(), 
        ['agent_id' => $request->agent_id]);
    
    return response()->json(['success' => true, 'data' => $property->load('agents')], 201);
}

// DELETE /api/v1/admin/properties/{property}/agents/{agent}
public function removeAssignment(Property $property, Agent $agent): JsonResponse {
    $property->agents()->detach($agent->id);
    ActivityLog::log('deleted', 'PropertyAgentAssignment', $property->id, auth()->id());
    
    return response()->json(['success' => true]);
}
```

**Commit:** `feat: implement property agent assignment endpoints`

---

### Task 3.11: Phase 3 Tests
**Test Files:**
- `tests/Feature/LeadCrudTest.php`
- `tests/Feature/LeadAssignmentTest.php`
- `tests/Feature/LeadCSVExportTest.php`
- `tests/Unit/LeadServiceTest.php`

**Test Coverage:**
```php
class LeadCrudTest extends TestCase {
    // Store lead (public)
    // Index leads with filters (status, search, date range)
    // Show single lead with notes
    // Update lead status
    // Update lead assignment
    // Add note to lead
    // Get lead notes with pagination
    // Delete note from lead
    // Soft delete lead
    // Restore lead
    // Authorization checks
}

class LeadCSVExportTest extends TestCase {
    // Export with no filters
    // Export with status filter
    // Export with date range filter
    // CSV contains correct columns
    // CSV escapes properly
}

class LeadServiceTest extends TestCase {
    // createLead dispatches notification
    // assignLead queues email
    // changeStatus logs activity
    // addNote creates record with user_id
    // exportCSV returns stream response
}
```

**Commit:** `test: add comprehensive test suite for leads CRUD and service`

---

## PHASE 4: BLOG & USER CONTENT (Days 4-5)

### Overview
Implement blog publishing system with tags, wishlists for property favorites, user preferences for currency/units, and flexible CMS page management.

### Task 4.1: BlogPost Model & Migration
**File:** `database/migrations/[timestamp]_create_blog_posts_table.php`  
**Model:** `app/Models/BlogPost.php`

**Migration:**
```php
Schema::create('blog_posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->string('excerpt');
    $table->longText('content');
    $table->string('featured_image')->nullable();
    $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
    $table->enum('status', ['draft', 'published', 'scheduled'])->default('draft');
    $table->timestamp('published_at')->nullable();
    $table->string('meta_title')->nullable();
    $table->string('meta_description')->nullable();
    $table->unsignedBigInteger('views_count')->default(0);
    $table->softDeletes();
    $table->timestamps();
    $table->index(['status', 'published_at']);
    $table->index(['author_id']);
});
```

**Model Relationships:**
```php
belongsTo(User::class, 'author_id')
belongsToMany(BlogTag::class, 'blog_post_tags')->withTimestamps()
```

**Model Scopes & Methods:**
```php
scopePublished() — where status = 'published' and published_at <= now()
scopeScheduled() — where status = 'scheduled' and published_at > now()
scopeByAuthor($authorId)
scopeSearch($query) — searches title, excerpt, content

public function publish(): void {
    $this->update(['status' => 'published', 'published_at' => now()]);
    ActivityLog::log('updated', 'BlogPost', $this->id, auth()->id(), ['status' => 'published']);
}

public function incrementViews(): void {
    $this->increment('views_count');
    cache()->forget('blog.post.' . $this->id);
}
```

**Commit:** `feat: create blog post model and migration with publishing`

---

### Task 4.2: BlogTag Model & Migration
**File:** `database/migrations/[timestamp]_create_blog_tags_table.php`  
**Model:** `app/Models/BlogTag.php`

**Migration:**
```php
Schema::create('blog_tags', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->string('slug')->unique();
    $table->timestamps();
});

Schema::create('blog_post_tags', function (Blueprint $table) {
    $table->foreignId('blog_post_id')->constrained('blog_posts')->onDelete('cascade');
    $table->foreignId('blog_tag_id')->constrained('blog_tags')->onDelete('cascade');
    $table->primary(['blog_post_id', 'blog_tag_id']);
    $table->timestamps();
});
```

**Model:**
```php
class BlogTag {
    public function blogPosts() {
        return $this->belongsToMany(BlogPost::class, 'blog_post_tags')->withTimestamps();
    }

    protected static function booted() {
        static::creating(function ($tag) {
            $tag->slug = Str::slug($tag->name);
        });
    }
}
```

**Commit:** `feat: create blog tag model and pivot table migration`

---

### Task 4.3: Wishlist Model & Migration
**File:** `database/migrations/[timestamp]_create_wishlists_table.php`  
**Model:** `app/Models/Wishlist.php`

**Migration:**
```php
Schema::create('wishlists', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('property_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    $table->unique(['user_id', 'property_id']);
    $table->index(['user_id', 'created_at']);
});
```

**Model:**
```php
class Wishlist {
    public function user() {
        return $this->belongsTo(User::class);
    }

    public function property() {
        return $this->belongsTo(Property::class);
    }
}
```

**Update User Model:**
```php
public function wishlists() {
    return $this->hasMany(Wishlist::class);
}

public function favoriteProperties() {
    return $this->hasManyThrough(Property::class, Wishlist::class);
}
```

**Commit:** `feat: create wishlist model and migration`

---

### Task 4.4: UserPreference Model & Migration
**File:** `database/migrations/[timestamp]_create_user_preferences_table.php`  
**Model:** `app/Models/UserPreference.php`

**Migration:**
```php
Schema::create('user_preferences', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
    $table->enum('currency', ['AED', 'USD', 'EUR', 'GBP'])->default('AED');
    $table->enum('area_unit', ['SQ.FT', 'SQ.M'])->default('SQ.FT');
    $table->timestamps();
});
```

**Model:**
```php
class UserPreference {
    protected $table = 'user_preferences';
    
    public function user() {
        return $this->belongsTo(User::class);
    }
}
```

**Commit:** `feat: create user preference model and migration`

---

### Task 4.5: PageContent Model & Migration
**File:** `database/migrations/[timestamp]_create_page_contents_table.php`  
**Model:** `app/Models/PageContent.php`

**Migration:**
```php
Schema::create('page_contents', function (Blueprint $table) {
    $table->id();
    $table->string('page_slug');
    $table->string('section_key');
    $table->json('content');
    $table->timestamps();
    $table->unique(['page_slug', 'section_key']);
    $table->index(['page_slug']);
});
```

**Model:**
```php
class PageContent {
    protected $casts = ['content' => 'json'];

    public static function getByPage($slug) {
        return cache()->remember("page_content.$slug", 3600, function () use ($slug) {
            return self::where('page_slug', $slug)->get()->keyBy('section_key');
        });
    }

    public static function setSection($pageSlug, $sectionKey, array $content) {
        $page = self::firstOrCreate(
            ['page_slug' => $pageSlug, 'section_key' => $sectionKey],
            ['content' => $content]
        );
        
        if ($page->wasRecentlyCreated === false) {
            $page->update(['content' => $content]);
        }
        
        cache()->forget("page_content.$pageSlug");
        return $page;
    }
}
```

**Commit:** `feat: create page content model for CMS`

---

### Task 4.6: Blog CRUD Form Requests & Validation
**Files:**
- `app/Http/Requests/StoreBlogPostRequest.php`
- `app/Http/Requests/UpdateBlogPostRequest.php`

**StoreBlogPostRequest:**
```php
class StoreBlogPostRequest extends FormRequest {
    public function authorize(): bool {
        return auth()->check() && auth()->user()->isManager();
    }

    public function rules(): array {
        return [
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string|min:100',
            'featured_image' => 'nullable|string|url',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'required_if:status,published,scheduled|date|after_or_equal:now',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
        ];
    }
}
```

**UpdateBlogPostRequest:** Similar with `sometimes` rules

**Commit:** `feat: create blog post form requests with validation`

---

### Task 4.7: Blog Controller & Endpoints
**File:** `app/Http/Controllers/BlogController.php`

**Key Methods:**
```php
class BlogController extends Controller {
    // GET /api/v1/blog (public, paginated, published only)
    public function index(Request $request): JsonResponse {
        $posts = BlogPost::published()
            ->when($request->search, fn($q) => $q->search($request->search))
            ->latest('published_at')
            ->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $posts->items(),
            'meta' => ['pagination' => $this->paginationMeta($posts)],
        ]);
    }

    // GET /api/v1/blog/{slug} (public)
    public function show(string $slug): JsonResponse {
        $post = BlogPost::where('slug', $slug)->firstOrFail();
        
        if ($post->status !== 'published') {
            abort(404);
        }
        
        $post->incrementViews();
        return response()->json([
            'success' => true,
            'data' => $post->load('author', 'tags'),
        ]);
    }

    // POST /api/v1/admin/blog (manager+)
    #[Middleware('role:manager,super_admin')]
    public function store(StoreBlogPostRequest $request): JsonResponse {
        $validated = $request->validated();
        $validated['author_id'] = auth()->id();
        $validated['slug'] = Str::slug($validated['title']);
        
        $post = BlogPost::create($validated);
        
        if ($request->tags) {
            $post->tags()->sync($request->tags);
        }
        
        if ($validated['status'] === 'published') {
            $post->publish();
            BlogPublishedJob::dispatch($post);
        }
        
        ActivityLog::log('created', 'BlogPost', $post->id, auth()->id());
        
        return response()->json([
            'success' => true,
            'data' => $post->load('author', 'tags'),
            'message' => 'Blog post created successfully',
        ], 201);
    }

    // GET /api/v1/admin/blog (manager+)
    #[Middleware('role:manager,super_admin')]
    public function adminIndex(Request $request): JsonResponse {
        $posts = BlogPost::query()
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->search($request->search))
            ->latest('created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $posts->items(),
            'meta' => ['pagination' => $this->paginationMeta($posts)],
        ]);
    }

    // PUT /api/v1/admin/blog/{id} (manager+)
    #[Middleware('role:manager,super_admin')]
    public function update(BlogPost $post, UpdateBlogPostRequest $request): JsonResponse {
        $validated = $request->validated();
        
        if (isset($validated['status']) && $validated['status'] === 'published' && $post->status !== 'published') {
            $validated['published_at'] = now();
        }
        
        $post->update($validated);
        
        if (isset($request->tags)) {
            $post->tags()->sync($request->tags);
        }
        
        ActivityLog::log('updated', 'BlogPost', $post->id, auth()->id());
        
        return response()->json(['success' => true, 'data' => $post->load('author', 'tags')]);
    }

    // DELETE /api/v1/admin/blog/{id} (manager+)
    // POST /api/v1/admin/blog/{id}/restore (manager+)
    // GET /api/v1/blog/tags (public)
    // POST /api/v1/admin/blog/tags (manager+)
}
```

**Commit:** `feat: implement blog CRUD endpoints with publishing and tags`

---

### Task 4.8: Wishlist Controller & Endpoints
**File:** `app/Http/Controllers/WishlistController.php`

**Endpoints:**
```php
class WishlistController extends Controller {
    // GET /api/v1/wishlists (auth)
    public function index(): JsonResponse {
        $wishlists = auth()->user()->wishlists()
            ->with('property.images', 'property.area')
            ->latest()
            ->paginate(12);
        
        return response()->json([
            'success' => true,
            'data' => $wishlists->items(),
            'meta' => ['pagination' => $this->paginationMeta($wishlists)],
        ]);
    }

    // POST /api/v1/wishlists (auth)
    public function store(Request $request): JsonResponse {
        $request->validate(['property_id' => 'required|exists:properties,id']);
        
        $exists = auth()->user()->wishlists()
            ->where('property_id', $request->property_id)
            ->exists();
        
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Property already in wishlist',
            ], 409);
        }
        
        $wishlist = auth()->user()->wishlists()->create(['property_id' => $request->property_id]);
        
        return response()->json([
            'success' => true,
            'data' => $wishlist,
            'message' => 'Added to wishlist',
        ], 201);
    }

    // DELETE /api/v1/wishlists/{id} (auth)
    public function destroy(Wishlist $wishlist): JsonResponse {
        $this->authorize('delete', $wishlist);
        $wishlist->delete();
        
        return response()->json(['success' => true, 'message' => 'Removed from wishlist']);
    }
}
```

**Commit:** `feat: implement wishlist endpoints for favorites`

---

### Task 4.9: User Preference Controller & Endpoints
**File:** `app/Http/Controllers/UserPreferenceController.php`

**Endpoints:**
```php
class UserPreferenceController extends Controller {
    // GET /api/v1/user/preferences (auth)
    public function show(): JsonResponse {
        $preference = auth()->user()->userPreference ?? UserPreference::create([
            'user_id' => auth()->id(),
        ]);
        
        return response()->json(['success' => true, 'data' => $preference]);
    }

    // PUT /api/v1/user/preferences (auth)
    public function update(Request $request): JsonResponse {
        $request->validate([
            'currency' => 'sometimes|in:AED,USD,EUR,GBP',
            'area_unit' => 'sometimes|in:SQ.FT,SQ.M',
        ]);
        
        $preference = auth()->user()->userPreference ?? UserPreference::create(['user_id' => auth()->id()]);
        $preference->update($request->only(['currency', 'area_unit']));
        
        return response()->json(['success' => true, 'data' => $preference]);
    }
}
```

**Commit:** `feat: implement user preference endpoints`

---

### Task 4.10: CMS Page Controller & Endpoints
**File:** `app/Http/Controllers/PageContentController.php`

**Endpoints:**
```php
class PageContentController extends Controller {
    // GET /api/v1/pages/{slug} (public)
    public function show(string $slug): JsonResponse {
        $page = PageContent::getByPage($slug);
        
        if ($page->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $page->pluck('content', 'section_key'),
        ]);
    }

    // PUT /api/v1/admin/cms/{page_slug} (super_admin)
    #[Middleware('role:super_admin')]
    public function update(string $pageSlug, Request $request): JsonResponse {
        $sections = $request->validate(['sections' => 'required|array']);
        
        foreach ($sections['sections'] as $sectionKey => $content) {
            PageContent::setSection($pageSlug, $sectionKey, $content);
        }
        
        ActivityLog::log('updated', 'PageContent', 0, auth()->id(), ['page' => $pageSlug]);
        
        return response()->json([
            'success' => true,
            'data' => PageContent::getByPage($pageSlug)->pluck('content', 'section_key'),
        ]);
    }
}
```

**Commit:** `feat: implement CMS page content endpoints`

---

### Task 4.11: Phase 4 Tests
**Test Files:**
- `tests/Feature/BlogCrudTest.php`
- `tests/Feature/WishlistTest.php`
- `tests/Feature/UserPreferenceTest.php`
- `tests/Feature/PageContentTest.php`

**Test Coverage:**
```php
class BlogCrudTest extends TestCase {
    // Create draft post
    // Create and publish post
    // Create scheduled post
    // Update post status to published
    // Soft delete post
    // Restore post
    // Search posts
    // Filter by author
    // Increment views on show
    // Tag management
}

class WishlistTest extends TestCase {
    // Add to wishlist
    // List wishlists
    // Remove from wishlist
    // Cannot add duplicate
    // Authorization checks
}
```

**Commit:** `test: add comprehensive blog and wishlist test suite`

---

## PHASE 5: ANALYTICS & ADMIN (Day 5)

### Overview
Implement analytics dashboards with caching, user management (super_admin), settings management, and complete master data CRUD endpoints.

### Task 5.1: AnalyticsService Implementation
**File:** `app/Services/AnalyticsService.php`

```php
class AnalyticsService {
    /**
     * Get overview stats: leads, properties, conversion
     */
    public function getOverviewStats(string $period = 'month'): array {
        return cache()->remember('analytics.overview.' . $period, 3600, function () use ($period) {
            $dateFrom = $this->getPeriodStart($period);
            
            return [
                'total_leads' => Lead::count(),
                'new_leads' => Lead::where('created_at', '>=', $dateFrom)->count(),
                'total_properties' => Property::count(),
                'available_properties' => Property::available()->count(),
                'featured_properties' => Property::featured()->count(),
                'leads_by_status' => Lead::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'leads_by_source' => Lead::select('source', DB::raw('count(*) as count'))
                    ->groupBy('source')
                    ->pluck('count', 'source')
                    ->toArray(),
                'top_properties' => Property::orderByDesc('views_count')
                    ->limit(5)
                    ->get(['id', 'title', 'views_count', 'status']),
            ];
        });
    }

    /**
     * Property analytics: views over time
     */
    public function getPropertyStats(string $dateFrom, string $dateTo): array {
        return cache()->remember('analytics.properties.' . $dateFrom . '.' . $dateTo, 600, function () use ($dateFrom, $dateTo) {
            return [
                'views_by_type' => Property::select('type', DB::raw('sum(views_count) as total_views'))
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->groupBy('type')
                    ->pluck('total_views', 'type')
                    ->toArray(),
                'properties_by_area' => Property::select('area_id', 'areas.name', DB::raw('count(*) as count'))
                    ->join('areas', 'properties.area_id', '=', 'areas.id')
                    ->whereBetween('properties.created_at', [$dateFrom, $dateTo])
                    ->groupBy('area_id', 'areas.name')
                    ->get(['name', 'count'])
                    ->pluck('count', 'name')
                    ->toArray(),
                'properties_by_developer' => Property::select('developer_id', 'developers.name', DB::raw('count(*) as count'))
                    ->join('developers', 'properties.developer_id', '=', 'developers.id')
                    ->whereBetween('properties.created_at', [$dateFrom, $dateTo])
                    ->groupBy('developer_id', 'developers.name')
                    ->get(['name', 'count'])
                    ->pluck('count', 'name')
                    ->toArray(),
            ];
        });
    }

    /**
     * Lead analytics: conversion funnel
     */
    public function getLeadStats(string $dateFrom, string $dateTo): array {
        return cache()->remember('analytics.leads.' . $dateFrom . '.' . $dateTo, 600, function () use ($dateFrom, $dateTo) {
            $leads = Lead::whereBetween('created_at', [$dateFrom, $dateTo]);
            
            return [
                'conversion_funnel' => [
                    'new' => $leads->clone()->where('status', 'new')->count(),
                    'contacted' => $leads->clone()->where('status', 'contacted')->count(),
                    'qualified' => $leads->clone()->where('status', 'qualified')->count(),
                    'closed' => $leads->clone()->where('status', 'closed')->count(),
                ],
                'source_breakdown' => Lead::whereBetween('created_at', [$dateFrom, $dateTo])
                    ->select('source', DB::raw('count(*) as count'))
                    ->groupBy('source')
                    ->pluck('count', 'source')
                    ->toArray(),
                'agent_performance' => User::whereHas('leads', function ($q) use ($dateFrom, $dateTo) {
                    $q->whereBetween('created_at', [$dateFrom, $dateTo]);
                })
                ->select('users.id', 'users.name', DB::raw('count(leads.id) as lead_count'))
                ->leftJoin('leads', 'users.id', '=', 'leads.assigned_to')
                ->groupBy('users.id', 'users.name')
                ->get(['name', 'lead_count'])
                ->pluck('lead_count', 'name')
                ->toArray(),
            ];
        });
    }

    private function getPeriodStart(string $period): Carbon {
        return match ($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'quarter' => now()->subQuarter(),
            'year' => now()->subYear(),
            default => now()->subMonth(),
        };
    }

    public function invalidateCache(): void {
        cache()->forget('analytics.overview.*');
        cache()->forget('analytics.properties.*');
        cache()->forget('analytics.leads.*');
    }
}
```

**Commit:** `feat: implement analytics service with caching`

---

### Task 5.2: Analytics Controller & Endpoints
**File:** `app/Http/Controllers/AnalyticsController.php`

**Endpoints:**
```php
class AnalyticsController extends Controller {
    public function __construct(private AnalyticsService $analyticsService) {}

    // GET /api/v1/admin/analytics/overview?period=month (manager+)
    #[Middleware('role:manager,super_admin')]
    public function overview(Request $request): JsonResponse {
        $period = $request->validate(['period' => 'sometimes|in:week,month,quarter,year'])['period'] ?? 'month';
        
        $stats = $this->analyticsService->getOverviewStats($period);
        
        return response()->json(['success' => true, 'data' => $stats]);
    }

    // GET /api/v1/admin/analytics/properties (manager+)
    #[Middleware('role:manager,super_admin')]
    public function properties(Request $request): JsonResponse {
        $validated = $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);
        
        $stats = $this->analyticsService->getPropertyStats($validated['date_from'], $validated['date_to']);
        
        return response()->json(['success' => true, 'data' => $stats]);
    }

    // GET /api/v1/admin/analytics/leads (manager+)
    #[Middleware('role:manager,super_admin')]
    public function leads(Request $request): JsonResponse {
        $validated = $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);
        
        $stats = $this->analyticsService->getLeadStats($validated['date_from'], $validated['date_to']);
        
        return response()->json(['success' => true, 'data' => $stats]);
    }
}
```

**Commit:** `feat: implement analytics controller and endpoints`

---

### Task 5.3: User Management Controller
**File:** `app/Http/Controllers/UserManagementController.php`

**Endpoints:**
```php
class UserManagementController extends Controller {
    // GET /api/v1/admin/users (super_admin)
    #[Middleware('role:super_admin')]
    public function index(Request $request): JsonResponse {
        $users = User::query()
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->search, fn($q) => $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%'))
            ->when($request->active !== null, fn($q) => $q->where('is_active', $request->active))
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => ['pagination' => $this->paginationMeta($users)],
        ]);
    }

    // POST /api/v1/admin/users (super_admin)
    #[Middleware('role:super_admin')]
    public function store(Request $request): JsonResponse {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,manager,agent',
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        if ($validated['role'] === 'agent') {
            UserPreference::create(['user_id' => $user->id]);
        }

        ActivityLog::log('created', 'User', $user->id, auth()->id());

        return response()->json(['success' => true, 'data' => $user], 201);
    }

    // PUT /api/v1/admin/users/{id} (super_admin)
    #[Middleware('role:super_admin')]
    public function update(User $user, Request $request): JsonResponse {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:super_admin,manager,agent',
            'is_active' => 'sometimes|boolean',
        ]);

        $oldData = $user->only(array_keys($validated));
        $user->update($validated);

        ActivityLog::log('updated', 'User', $user->id, auth()->id(), $oldData);

        return response()->json(['success' => true, 'data' => $user]);
    }

    // DELETE /api/v1/admin/users/{id} (super_admin)
    #[Middleware('role:super_admin')]
    public function destroy(User $user): JsonResponse {
        // Soft delete to preserve data integrity
        $user->delete();
        ActivityLog::log('deleted', 'User', $user->id, auth()->id());

        return response()->json(['success' => true, 'message' => 'User deleted']);
    }

    // GET /api/v1/admin/users/{id} (super_admin)
    #[Middleware('role:super_admin')]
    public function show(User $user): JsonResponse {
        return response()->json(['success' => true, 'data' => $user->load('agent.agency', 'wishlists')]);
    }
}
```

**Commit:** `feat: implement user management endpoints (super_admin)`

---

### Task 5.4: Settings Management Controller
**File:** `app/Http/Controllers/SettingsController.php`

**Endpoints:**
```php
class SettingsController extends Controller {
    // GET /api/v1/settings/public (public)
    public function publicSettings(): JsonResponse {
        $settings = cache()->remember('settings.public', 3600, function () {
            return Setting::where('is_public', true)
                ->get(['key', 'value'])
                ->keyBy('key')
                ->map(fn($s) => json_decode($s->value, true) ?? $s->value);
        });

        return response()->json(['success' => true, 'data' => $settings]);
    }

    // GET /api/v1/admin/settings (super_admin)
    #[Middleware('role:super_admin')]
    public function index(): JsonResponse {
        $settings = Setting::all(['key', 'value'])
            ->keyBy('key')
            ->map(fn($s) => json_decode($s->value, true) ?? $s->value);

        return response()->json(['success' => true, 'data' => $settings]);
    }

    // PUT /api/v1/admin/settings (super_admin)
    #[Middleware('role:super_admin')]
    public function update(Request $request): JsonResponse {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'string',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => is_array($value) ? json_encode($value) : $value]);
        }

        cache()->forget('settings.public');
        ActivityLog::log('updated', 'Settings', 0, auth()->id());

        return response()->json(['success' => true, 'message' => 'Settings updated']);
    }
}
```

**Commit:** `feat: implement settings management endpoints`

---

### Task 5.5: Master Data CRUD Controllers
**Files:**
- `app/Http/Controllers/AreaController.php`
- `app/Http/Controllers/DeveloperController.php`
- (Expanded Agency & Agent controllers from Phase 3)

**Key Implementation:**
- Full CRUD for Areas (manager+)
- Full CRUD for Developers (manager+)
- Slug auto-generation and uniqueness validation
- Soft delete support
- Activity logging

**Commit:** `feat: implement area and developer CRUD endpoints`

---

### Task 5.6: Phase 5 Tests
**Test Files:**
- `tests/Feature/AnalyticsTest.php`
- `tests/Feature/UserManagementTest.php`
- `tests/Feature/SettingsTest.php`
- `tests/Unit/AnalyticsServiceTest.php`

**Test Coverage:**
```php
class AnalyticsTest extends TestCase {
    // Overview stats caching
    // Overview stats by period
    // Property stats with date range
    // Lead stats conversion funnel
    // Authorization checks
}

class UserManagementTest extends TestCase {
    // List users with filters
    // Create user
    // Update user role
    // Soft delete user
    // Super admin only
}
```

**Commit:** `test: add comprehensive analytics and admin test suite`

---

## PHASE 6: POLISH & DOCUMENTATION (Days 5-6)

### Overview
Finalize API with comprehensive documentation, rate limiting, error handling refinement, and extensive test coverage.

### Task 6.1: OpenAPI/Swagger Documentation Setup
**File:** `config/l5-swagger.php` (via Laravel Swagger/L5 Swagger)

**Installation & Setup:**
```bash
composer require "darkaonline/l5-swagger"
php artisan vendor:publish --provider="L5Swagger\L5SwaggerServiceProvider"
```

**Documentation Structure:**
```php
#[OpenApi\Attributes\Info(
    title: "EVOORION API",
    version: "1.0.0",
    description: "Luxury Dubai Real Estate Platform API"
)]
class AuthController {
    #[Post('/api/v1/auth/login')]
    #[RequestBody(
        required: true,
        content: new JsonContent(
            properties: [
                'email' => new Property(type: 'string'),
                'password' => new Property(type: 'string'),
            ]
        )
    )]
    public function login(LoginRequest $request) {}
}
```

**Generate Docs:**
```bash
php artisan l5-swagger:generate
```

**Endpoints to Document:**
- All public endpoints (properties, blog, leads submission)
- All auth endpoints (login, logout, preferences)
- All admin endpoints (CRUD, analytics)
- Request/response schemas
- Error responses

**Commit:** `docs: add OpenAPI/Swagger documentation`

---

### Task 6.2: Rate Limiting Middleware
**File:** `app/Http/Middleware/RateLimitMiddleware.php`

**Implementation:**
```php
class RateLimitMiddleware {
    public function handle(Request $request, Closure $next): Response {
        $key = $this->getKey($request);
        
        if (auth()->check()) {
            $limit = config('api.rate_limit.auth', 300); // 300/min
            $prefix = 'rate_limit.auth.' . auth()->id();
        } else {
            $limit = config('api.rate_limit.public', 60); // 60/min
            $prefix = 'rate_limit.public.' . $request->ip();
        }

        $attempts = cache()->increment($prefix, 1);
        
        if ($attempts === 1) {
            cache()->expire($prefix, 60);
        }

        if ($attempts > $limit) {
            return response()->json([
                'success' => false,
                'message' => 'Rate limit exceeded',
            ], 429);
        }

        return $next($request)
            ->header('X-RateLimit-Limit', $limit)
            ->header('X-RateLimit-Remaining', max(0, $limit - $attempts));
    }

    private function getKey(Request $request): string {
        return auth()->check() ? 'auth.' . auth()->id() : $request->ip();
    }
}
```

**Register in Kernel:**
```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'api' => [
        // ...
        RateLimitMiddleware::class,
    ],
];
```

**Commit:** `feat: implement rate limiting middleware (60/min public, 300/min auth)`

---

### Task 6.3: Enhanced Error Handling
**File:** `app/Exceptions/Handler.php`

**Implementation:**
```php
public function register(): void {
    $this->reportable(function (Throwable $e) {
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'meta' => ['errors' => $e->errors()],
            ], 422);
        }

        if ($e instanceof AuthorizationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found',
            ], 404);
        }

        if ($e instanceof ThrottleRequestsException) {
            return response()->json([
                'success' => false,
                'message' => 'Too many requests',
            ], 429);
        }

        return response()->json([
            'success' => false,
            'message' => env('APP_DEBUG') ? $e->getMessage() : 'Internal server error',
            'debug' => env('APP_DEBUG') ? [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ] : null,
        ], 500);
    });
}
```

**Commit:** `feat: enhance error handling with consistent response format`

---

### Task 6.4: CORS Configuration
**File:** `config/cors.php` or Middleware setup

**Configuration:**
```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'localhost:3000,localhost:3001')),
    'allowed_origins_patterns' => [
        env('PRODUCTION_URL'),
        env('PRODUCTION_ADMIN_URL'),
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    'max_age' => 86400,
    'supports_credentials' => true,
];
```

**Commit:** `feat: configure CORS for frontend and admin domains`

---

### Task 6.5: Comprehensive Test Suite
**Test Files to Complete:**
- `tests/Feature/AuthTest.php` — login, logout, token validation
- `tests/Feature/PropertyTest.php` — filtering, pagination, views counter
- `tests/Feature/AdminAuthorizationTest.php` — role-based access
- `tests/Feature/RateLimitTest.php` — 429 responses
- `tests/Unit/ModelScopeTest.php` — all model scopes
- `tests/Unit/ServiceTest.php` — all services

**Coverage Report:**
```bash
php artisan test --coverage
```

**Target:** 80%+ for critical paths (models, services, critical endpoints)

**Commit:** `test: add comprehensive test suite achieving 80%+ coverage`

---

### Task 6.6: Database Seeder & Seeders
**Files:**
- `database/seeders/DatabaseSeeder.php`
- `database/seeders/AdminUserSeeder.php`
- `database/seeders/PropertiesSeeder.php`
- `database/seeders/AreasSeeder.php`
- `database/seeders/DevelopersSeeder.php`

**Example Seeder:**
```php
class DatabaseSeeder extends Seeder {
    public function run(): void {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@evoorion.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // Create areas
        Area::create(['name' => 'Palm Jumeirah', 'description' => 'Luxury island development']);
        // ... more areas

        // Create developers
        Developer::create(['name' => 'Emaar', 'description' => 'Leading developer']);
        // ... more developers

        // Create sample properties
        Property::factory()->count(50)->create();

        // Create settings
        Setting::create(['key' => 'whatsapp', 'value' => '+971501234567']);
        // ... more settings
    }
}
```

**Run Seeders:**
```bash
php artisan migrate:fresh --seed
```

**Commit:** `feat: add comprehensive database seeders`

---

### Task 6.7: API Documentation README
**File:** `docs/API.md` or `README.md` section

**Content:**
- API overview and versioning
- Authentication (Sanctum)
- Rate limiting
- Error responses
- Examples for each endpoint category
- Testing instructions
- Environment setup

**Commit:** `docs: add comprehensive API documentation`

---

### Task 6.8: Final Integration Testing
**Test File:** `tests/Feature/IntegrationTest.php`

**Scenarios:**
- End-to-end property creation with images
- Lead submission to assignment to closure
- Blog post creation to publishing
- User signup to preference configuration
- Analytics dashboard data aggregation

**Commit:** `test: add end-to-end integration tests`

---

## SUMMARY OF DELIVERABLES

### Models Created (12)
1. Lead
2. LeadNote
3. Agency
4. Agent
5. PropertyAgentAssignment
6. BlogPost
7. BlogTag
8. Wishlist
9. UserPreference
10. PageContent
11. ActivityLog
12. Setting (if not existing)

### Controllers Created (8)
1. LeadController
2. AgencyController
3. AgentController
4. BlogController
5. WishlistController
6. UserPreferenceController
7. AnalyticsController
8. UserManagementController (+ PageContentController, SettingsController, Master Data controllers)

### Services Created (4)
1. LeadService
2. AnalyticsService
3. PropertyService (extended)
4. NotificationService (extended with new jobs)

### Form Requests Created (6)
1. StoreLeadRequest
2. UpdateLeadRequest
3. StoreBlogPostRequest
4. UpdateBlogPostRequest
5. StoreAgencyRequest
6. StoreAgentRequest

### Migrations Created (8)
1. create_leads_table
2. create_lead_notes_table
3. create_agencies_table
4. create_agents_table
5. create_property_agent_assignments_table
6. create_blog_posts_table
7. create_blog_tags_table
8. create_wishlists_table
+ Additional: user_preferences, page_contents, activity_logs, settings

### Tests Created (15+)
- LeadCrudTest
- LeadAssignmentTest
- LeadCSVExportTest
- BlogCrudTest
- WishlistTest
- AnalyticsTest
- UserManagementTest
- IntegrationTest
- Unit tests for services and models

### Configuration Files
- OpenAPI/Swagger setup (l5-swagger)
- Rate limiting middleware
- CORS configuration
- Error handler enhancement

---

## GIT COMMIT SEQUENCE

```
Phase 3: Leads & Agents
1. feat: create leads model, migration, and scopes
2. feat: create lead notes model and migration
3. feat: create agency and agent models with migrations
4. feat: create property agent assignment model
5. feat: implement lead service with assignment, status, notes, and CSV export
6. feat: create activity log model and migration
7. feat: create lead form requests with validation rules
8. feat: implement lead controller with CRUD, notes, CSV export endpoints
9. feat: implement agency and agent CRUD endpoints
10. feat: implement property agent assignment endpoints
11. test: add comprehensive test suite for leads CRUD and service

Phase 4: Blog & User Content
12. feat: create blog post model and migration with publishing
13. feat: create blog tag model and pivot table migration
14. feat: create wishlist model and migration
15. feat: create user preference model and migration
16. feat: create page content model for CMS
17. feat: create blog post form requests with validation
18. feat: implement blog CRUD endpoints with publishing and tags
19. feat: implement wishlist endpoints for favorites
20. feat: implement user preference endpoints
21. feat: implement CMS page content endpoints
22. test: add comprehensive blog and wishlist test suite

Phase 5: Analytics & Admin
23. feat: implement analytics service with caching
24. feat: implement analytics controller and endpoints
25. feat: implement user management endpoints (super_admin)
26. feat: implement settings management endpoints
27. feat: implement area and developer CRUD endpoints
28. test: add comprehensive analytics and admin test suite

Phase 6: Polish & Documentation
29. docs: add OpenAPI/Swagger documentation
30. feat: implement rate limiting middleware (60/min public, 300/min auth)
31. feat: enhance error handling with consistent response format
32. feat: configure CORS for frontend and admin domains
33. feat: add comprehensive database seeders
34. docs: add comprehensive API documentation
35. test: add comprehensive test suite achieving 80%+ coverage
36. test: add end-to-end integration tests
```

---

## EXECUTION NOTES

### Daily Breakdown (Recommended)
- **Day 1 (Phase 3a):** Tasks 3.1-3.6 (Models, Service, Activity Logging)
- **Day 2 (Phase 3b):** Tasks 3.7-3.11 (Controllers, Endpoints, Tests)
- **Day 3 (Phase 4a):** Tasks 4.1-4.5 (Models, Migrations)
- **Day 4 (Phase 4b-5a):** Tasks 4.6-4.11 + 5.1-5.4 (Controllers, Analytics)
- **Day 5 (Phase 5b-6a):** Tasks 5.5-5.6 + 6.1-6.3 (Master Data, Documentation, Middleware)
- **Day 6 (Phase 6b):** Tasks 6.4-6.8 (CORS, Tests, Seeders, Finalization)

### Testing Strategy
- Run tests after each major section (after controllers)
- Aim for 80%+ coverage on critical paths
- Use SQLite :memory: for speed
- Mock external services (Cloudinary, Mail)

### Code Quality
- Follow PSR-12 standards
- Use type hints throughout
- Document complex logic with comments
- Use meaningful variable names

---

**Plan Created:** 2026-06-04  
**Status:** Ready for subagent-driven development  
**Estimated Duration:** 4 days (Days 3-6 of project)  
**Total Lines of Code:** ~8,000-10,000 (including tests)
