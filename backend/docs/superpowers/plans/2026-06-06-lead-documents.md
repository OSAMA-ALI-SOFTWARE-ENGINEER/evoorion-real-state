# Lead Documents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Attach files (PDFs, Word docs, images) to leads with Cloudinary storage, enforcing a 20-document cap and agent-level IDOR protection.

**Architecture:** `LeadDocument` is a HasMany sub-resource of `Lead` — same pattern as `LeadTask`. Authorization delegates to `LeadPolicy` (two new methods). `CloudinaryService` gets a dedicated `uploadDocument()` method. The controller is thin: authorize → guard → delegate to service → persist.

**Tech Stack:** Laravel 12, PHP 8.2, Sanctum, Cloudinary SDK, SQLite (tests), Mockery (mocking CloudinaryService in tests)

**PHP binary:** `D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe`
**Run tests:** `& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test`
**Run single file:** `& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter=LeadDocumentTest`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `database/migrations/2026_06_06_000001_create_lead_documents_table.php` | Schema |
| Create | `app/Models/LeadDocument.php` | Eloquent model |
| Create | `database/factories/LeadDocumentFactory.php` | Test data |
| Modify | `app/Models/Lead.php` | Add `documents()` HasMany |
| Modify | `app/Services/CloudinaryService.php` | Add `uploadDocument()` |
| Create | `app/Http/Requests/StoreLeadDocumentRequest.php` | File validation |
| Modify | `app/Policies/LeadPolicy.php` | Add `addDocument()`, `deleteDocument()` |
| Create | `app/Http/Controllers/Api/V1/LeadDocumentController.php` | index / store / destroy |
| Modify | `routes/api.php` | 3 new routes |
| Create | `tests/Feature/Leads/LeadDocumentTest.php` | 11 feature tests |

---

## Task 1: Data Layer

**Files:**
- Create: `database/migrations/2026_06_06_000001_create_lead_documents_table.php`
- Create: `app/Models/LeadDocument.php`
- Create: `database/factories/LeadDocumentFactory.php`
- Modify: `app/Models/Lead.php`

- [ ] **Step 1: Create the migration**

Create `database/migrations/2026_06_06_000001_create_lead_documents_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lead_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('url');
            $table->string('public_id');
            $table->string('mime_type', 100);
            $table->unsignedInteger('size');
            $table->timestamps();

            $table->index('lead_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_documents');
    }
};
```

- [ ] **Step 2: Create the model**

Create `app/Models/LeadDocument.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'user_id',
        'name',
        'url',
        'public_id',
        'mime_type',
        'size',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

- [ ] **Step 3: Create the factory**

Create `database/factories/LeadDocumentFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\Lead;
use App\Models\LeadDocument;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeadDocument>
 */
class LeadDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'lead_id'   => Lead::factory(),
            'user_id'   => User::factory(),
            'name'      => fake()->word() . '.pdf',
            'url'       => 'https://res.cloudinary.com/demo/leads/documents/' . fake()->uuid(),
            'public_id' => 'leads/documents/' . fake()->uuid(),
            'mime_type' => 'application/pdf',
            'size'      => fake()->numberBetween(10000, 5000000),
        ];
    }
}
```

- [ ] **Step 4: Add `documents()` relationship to Lead**

In `app/Models/Lead.php`, add the import and relationship. The file already has `use Illuminate\Database\Eloquent\Relations\HasMany;`. Add the method after `tasks()`:

```php
public function documents(): HasMany
{
    return $this->hasMany(LeadDocument::class);
}
```

- [ ] **Step 5: Run the migration**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan migrate
```

Expected: `lead_documents` table created successfully.

- [ ] **Step 6: Commit**

```
git add database/migrations/2026_06_06_000001_create_lead_documents_table.php app/Models/LeadDocument.php database/factories/LeadDocumentFactory.php app/Models/Lead.php
git commit -m "feat: add LeadDocument model, migration, and factory"
```

---

## Task 2: Supporting Pieces

**Files:**
- Modify: `app/Services/CloudinaryService.php`
- Create: `app/Http/Requests/StoreLeadDocumentRequest.php`
- Modify: `app/Policies/LeadPolicy.php`

- [ ] **Step 1: Add `uploadDocument()` to CloudinaryService**

In `app/Services/CloudinaryService.php`, add this method after `uploadVideo()`:

```php
public function uploadDocument($file, $folder = 'leads/documents'): array
{
    $this->client();

    $result = Uploader::upload($file->getRealPath(), [
        'folder'        => $folder,
        'resource_type' => 'auto',
    ]);

    return [
        'url'       => $result['secure_url'],
        'public_id' => $result['public_id'],
    ];
}
```

- [ ] **Step 2: Create StoreLeadDocumentRequest**

Create `app/Http/Requests/StoreLeadDocumentRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ];
    }
}
```

- [ ] **Step 3: Add policy methods to LeadPolicy**

In `app/Policies/LeadPolicy.php`, add these two methods after `deleteNote()`:

```php
public function addDocument(User $user, Lead $lead): bool
{
    return $this->update($user, $lead);
}

public function deleteDocument(User $user, Lead $lead): bool
{
    return $this->update($user, $lead);
}
```

- [ ] **Step 4: Commit**

```
git add app/Services/CloudinaryService.php app/Http/Requests/StoreLeadDocumentRequest.php app/Policies/LeadPolicy.php
git commit -m "feat: add uploadDocument to CloudinaryService, request validation, and policy methods"
```

---

## Task 3: Controller Skeleton + Routes

**Files:**
- Create: `app/Http/Controllers/Api/V1/LeadDocumentController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create the controller with stub methods**

Create `app/Http/Controllers/Api/V1/LeadDocumentController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadDocumentRequest;
use App\Models\Lead;
use App\Models\LeadDocument;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;

/**
 * @group Lead Documents
 *
 * File attachments on leads. Agents manage documents on their assigned leads only.
 */
class LeadDocumentController extends Controller
{
    public function __construct(protected CloudinaryService $cloudinaryService) {}

    public function index(Lead $lead): JsonResponse
    {
        abort(501);
    }

    public function store(StoreLeadDocumentRequest $request, Lead $lead): JsonResponse
    {
        abort(501);
    }

    public function destroy(Lead $lead, LeadDocument $document): JsonResponse
    {
        abort(501);
    }
}
```

- [ ] **Step 2: Add routes to api.php**

In `routes/api.php`, add the import at the top with the other V1 imports:

```php
use App\Http\Controllers\Api\V1\LeadDocumentController;
```

Then in the `role:agent,manager,super_admin` middleware group, directly after the lead tasks block (after the `Route::post('leads/{lead}/tasks/{task}/complete', ...)` line), add:

```php
// Lead documents
Route::get('leads/{lead}/documents', [LeadDocumentController::class, 'index']);
Route::post('leads/{lead}/documents', [LeadDocumentController::class, 'store']);
Route::delete('leads/{lead}/documents/{document}', [LeadDocumentController::class, 'destroy']);
```

- [ ] **Step 3: Verify routes are registered**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan route:list --path=leads
```

Expected: three new rows for `GET`, `POST`, and `DELETE` on `api/v1/admin/leads/{lead}/documents`.

- [ ] **Step 4: Commit**

```
git add app/Http/Controllers/Api/V1/LeadDocumentController.php routes/api.php
git commit -m "feat: add LeadDocumentController skeleton and routes"
```

---

## Task 4: TDD — index Endpoint

**Files:**
- Create: `tests/Feature/Leads/LeadDocumentTest.php`

- [ ] **Step 1: Write the two index tests**

Create `tests/Feature/Leads/LeadDocumentTest.php` with only these two tests:

```php
<?php

namespace Tests\Feature\Leads;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\LeadDocument;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class LeadDocumentTest extends TestCase
{
    private function mockCloudinary(): void
    {
        $this->mock(CloudinaryService::class, function ($mock) {
            $mock->shouldReceive('uploadDocument')
                ->andReturn([
                    'url'       => 'https://res.cloudinary.com/demo/leads/documents/test-uuid',
                    'public_id' => 'leads/documents/test-uuid',
                ]);
            $mock->shouldReceive('deleteMedia')->andReturn(null);
        });
    }

    private function fakePdf(): UploadedFile
    {
        return UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');
    }

    public function test_agent_can_list_documents_on_assigned_lead(): void
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
        LeadDocument::factory()->count(3)->create([
            'lead_id' => $lead->id,
            'user_id' => $agent->user_id,
        ]);

        $response = $this->actingAs($agent->user)
            ->getJson("/api/v1/admin/leads/{$lead->id}/documents");

        $response->assertStatus(200)->assertJsonCount(3, 'data');
    }

    public function test_agent_cannot_list_documents_on_unassigned_lead(): void
    {
        $agent = Agent::factory()->create();
        $lead  = Lead::factory()->create(['assigned_to' => null]);

        $response = $this->actingAs($agent->user)
            ->getJson("/api/v1/admin/leads/{$lead->id}/documents");

        $response->assertStatus(403);
    }
}
```

- [ ] **Step 2: Run the tests — expect both to fail (501)**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter=LeadDocumentTest
```

Expected: 2 failures — `test_agent_can_list_documents_on_assigned_lead` gets 501, `test_agent_cannot_list_documents_on_unassigned_lead` gets 501.

- [ ] **Step 3: Implement `index()` in LeadDocumentController**

Replace the stub `index()` method in `app/Http/Controllers/Api/V1/LeadDocumentController.php`:

```php
public function index(Lead $lead): JsonResponse
{
    $this->authorize('view', $lead);

    $documents = $lead->documents()->with('user')->latest()->get();

    return response()->json(['success' => true, 'data' => $documents]);
}
```

- [ ] **Step 4: Run the tests — expect both to pass**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter=LeadDocumentTest
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```
git add tests/Feature/Leads/LeadDocumentTest.php app/Http/Controllers/Api/V1/LeadDocumentController.php
git commit -m "feat: implement LeadDocumentController::index with tests"
```

---

## Task 5: TDD — store Endpoint

**Files:**
- Modify: `tests/Feature/Leads/LeadDocumentTest.php`
- Modify: `app/Http/Controllers/Api/V1/LeadDocumentController.php`

- [ ] **Step 1: Add the six store tests to LeadDocumentTest**

Append these six test methods to the `LeadDocumentTest` class (after `test_agent_cannot_list_documents_on_unassigned_lead`):

```php
public function test_agent_can_upload_document_to_assigned_lead(): void
{
    $this->mockCloudinary();
    $agent = Agent::factory()->create();
    $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

    $response = $this->actingAs($agent->user)
        ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
            'file' => $this->fakePdf(),
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.name', 'agreement.pdf')
        ->assertJsonStructure(['data' => ['id', 'name', 'url', 'public_id', 'mime_type', 'size', 'user']]);

    $this->assertDatabaseHas('lead_documents', [
        'lead_id' => $lead->id,
        'name'    => 'agreement.pdf',
    ]);
}

public function test_agent_cannot_upload_to_unassigned_lead(): void
{
    $agent = Agent::factory()->create();
    $lead  = Lead::factory()->create(['assigned_to' => null]);

    $response = $this->actingAs($agent->user)
        ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
            'file' => $this->fakePdf(),
        ]);

    $response->assertStatus(403);
}

public function test_upload_rejects_disallowed_file_type(): void
{
    $agent = Agent::factory()->create();
    $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

    $response = $this->actingAs($agent->user)
        ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
            'file' => UploadedFile::fake()->create('malware.exe', 100, 'application/octet-stream'),
        ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['file']);
}

public function test_upload_rejects_file_over_10mb(): void
{
    $agent = Agent::factory()->create();
    $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);

    $response = $this->actingAs($agent->user)
        ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
            'file' => UploadedFile::fake()->create('large.pdf', 11000, 'application/pdf'),
        ]);

    $response->assertStatus(422)->assertJsonValidationErrors(['file']);
}

public function test_upload_rejected_when_lead_has_20_documents(): void
{
    $agent = Agent::factory()->create();
    $lead  = Lead::factory()->create(['assigned_to' => $agent->user_id]);
    LeadDocument::factory()->count(20)->create([
        'lead_id' => $lead->id,
        'user_id' => $agent->user_id,
    ]);

    $response = $this->actingAs($agent->user)
        ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
            'file' => $this->fakePdf(),
        ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Lead has reached the 20 document limit');
}

public function test_manager_can_upload_on_any_lead(): void
{
    $this->mockCloudinary();
    $manager = User::factory()->create(['role' => 'manager']);
    $lead    = Lead::factory()->create(['assigned_to' => null]);

    $response = $this->actingAs($manager)
        ->postJson("/api/v1/admin/leads/{$lead->id}/documents", [
            'file' => $this->fakePdf(),
        ]);

    $response->assertStatus(201);
}
```

- [ ] **Step 2: Run the tests — expect 6 new failures**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter=LeadDocumentTest
```

Expected: 2 passed (index tests), 6 failed (store tests all return 501).

- [ ] **Step 3: Implement `store()` in LeadDocumentController**

Replace the stub `store()` method:

```php
public function store(StoreLeadDocumentRequest $request, Lead $lead): JsonResponse
{
    $this->authorize('addDocument', $lead);

    if ($lead->documents()->count() >= 20) {
        return response()->json([
            'success' => false,
            'message' => 'Lead has reached the 20 document limit',
        ], 422);
    }

    $file     = $request->file('file');
    $uploaded = $this->cloudinaryService->uploadDocument($file);

    $document = $lead->documents()->create([
        'user_id'   => auth()->id(),
        'name'      => $file->getClientOriginalName(),
        'url'       => $uploaded['url'],
        'public_id' => $uploaded['public_id'],
        'mime_type' => $file->getMimeType(),
        'size'      => $file->getSize(),
    ]);

    return response()->json(['success' => true, 'data' => $document->fresh()->load('user')], 201);
}
```

- [ ] **Step 4: Run the tests — expect all 8 to pass**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter=LeadDocumentTest
```

Expected: 8 passed.

- [ ] **Step 5: Commit**

```
git add tests/Feature/Leads/LeadDocumentTest.php app/Http/Controllers/Api/V1/LeadDocumentController.php
git commit -m "feat: implement LeadDocumentController::store with tests"
```

---

## Task 6: TDD — destroy Endpoint

**Files:**
- Modify: `tests/Feature/Leads/LeadDocumentTest.php`
- Modify: `app/Http/Controllers/Api/V1/LeadDocumentController.php`

- [ ] **Step 1: Add the three destroy tests to LeadDocumentTest**

Append these three test methods at the end of the `LeadDocumentTest` class:

```php
public function test_agent_can_delete_document_from_assigned_lead(): void
{
    $this->mockCloudinary();
    $agent    = Agent::factory()->create();
    $lead     = Lead::factory()->create(['assigned_to' => $agent->user_id]);
    $document = LeadDocument::factory()->create([
        'lead_id' => $lead->id,
        'user_id' => $agent->user_id,
    ]);

    $response = $this->actingAs($agent->user)
        ->deleteJson("/api/v1/admin/leads/{$lead->id}/documents/{$document->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('lead_documents', ['id' => $document->id]);
}

public function test_cannot_delete_document_from_different_lead(): void
{
    $agent    = Agent::factory()->create();
    $lead1    = Lead::factory()->create(['assigned_to' => $agent->user_id]);
    $lead2    = Lead::factory()->create(['assigned_to' => $agent->user_id]);
    $document = LeadDocument::factory()->create([
        'lead_id' => $lead1->id,
        'user_id' => $agent->user_id,
    ]);

    $response = $this->actingAs($agent->user)
        ->deleteJson("/api/v1/admin/leads/{$lead2->id}/documents/{$document->id}");

    $response->assertStatus(404);
}

public function test_manager_can_delete_document_on_any_lead(): void
{
    $this->mockCloudinary();
    $manager  = User::factory()->create(['role' => 'manager']);
    $lead     = Lead::factory()->create(['assigned_to' => null]);
    $document = LeadDocument::factory()->create([
        'lead_id' => $lead->id,
        'user_id' => $manager->id,
    ]);

    $response = $this->actingAs($manager)
        ->deleteJson("/api/v1/admin/leads/{$lead->id}/documents/{$document->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('lead_documents', ['id' => $document->id]);
}
```

- [ ] **Step 2: Run the tests — expect 3 new failures**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter=LeadDocumentTest
```

Expected: 8 passed, 3 failed (destroy tests return 501).

- [ ] **Step 3: Implement `destroy()` in LeadDocumentController**

Replace the stub `destroy()` method:

```php
public function destroy(Lead $lead, LeadDocument $document): JsonResponse
{
    $this->authorize('deleteDocument', $lead);

    if ($document->lead_id !== $lead->id) {
        return response()->json(['success' => false, 'message' => 'Document not found on this lead'], 404);
    }

    $this->cloudinaryService->deleteMedia($document->public_id);
    $document->delete();

    return response()->json(['success' => true]);
}
```

- [ ] **Step 4: Run the tests — expect all 11 to pass**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test --filter=LeadDocumentTest
```

Expected: 11 passed.

- [ ] **Step 5: Commit**

```
git add tests/Feature/Leads/LeadDocumentTest.php app/Http/Controllers/Api/V1/LeadDocumentController.php
git commit -m "feat: implement LeadDocumentController::destroy with tests"
```

---

## Task 7: Full Test Suite Verification

**Files:** none

- [ ] **Step 1: Run the full test suite**

```
& "D:\laragon\bin\php\php-8.2.16-nts-Win32-vs16-x64\php.exe" artisan test
```

Expected: 228 tests passing (217 pre-existing + 11 new), zero failures.

If any pre-existing tests fail, they are regressions — do not proceed until they are fixed.

- [ ] **Step 2: Commit final state if not already committed**

If all tests pass and nothing is staged, the work is complete. Otherwise commit any remaining changes:

```
git status
```

All changes should already be committed from Tasks 1–6. Verify with `git log --oneline -6`.
