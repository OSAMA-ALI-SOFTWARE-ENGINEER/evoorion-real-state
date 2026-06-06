# Lead Documents — Design Spec

**Date:** 2026-06-06
**Status:** Approved

## Overview

Attach files (signed agreements, floor plans, photos of paper forms) to leads. Files are stored on Cloudinary and referenced by a `lead_documents` DB row. Authorization mirrors the existing lead task model.

---

## 1. Data Layer

### Migration — `lead_documents`

| Column | Type | Constraints |
|---|---|---|
| `id` | bigint | PK |
| `lead_id` | FK → leads | cascade delete |
| `user_id` | FK → users | cascade delete |
| `name` | string(255) | original filename for display |
| `url` | string | Cloudinary secure URL |
| `public_id` | string | Cloudinary public_id (used for deletion) |
| `mime_type` | string(100) | stored for display hints |
| `size` | unsignedInteger | bytes |
| `created_at` / `updated_at` | timestamps | |

Index: `lead_id` (primary lookup path).

### Model — `LeadDocument`

- `$fillable`: all columns above
- `$casts`: `size` → integer
- Relationships: `BelongsTo` Lead, `BelongsTo` User

### Lead model update

Add `documents(): HasMany` relationship to `Lead`.

### Factory — `LeadDocumentFactory`

Generates plausible fake values without hitting Cloudinary:
- `name`: `fake()->word() . '.pdf'`
- `url`: `fake()->url()`
- `public_id`: `'leads/documents/' . fake()->uuid()`
- `mime_type`: `'application/pdf'`
- `size`: `fake()->numberBetween(10000, 5000000)`

---

## 2. CloudinaryService

Add one method:

```php
public function uploadDocument($file, $folder = 'leads/documents'): array
{
    $this->client();
    $result = Uploader::upload($file->getRealPath(), [
        'folder'        => $folder,
        'resource_type' => 'auto',
    ]);
    return ['url' => $result['secure_url'], 'public_id' => $result['public_id']];
}
```

Semantically distinct from `uploadImage()` — keeps mocking and test setup clean.

---

## 3. Request Validation

**`StoreLeadDocumentRequest`**

| Field | Rules |
|---|---|
| `file` | `required`, `file`, `mimes:pdf,doc,docx,jpg,jpeg,png`, `max:10240` (10 MB) |

The 20-document-per-lead cap is enforced in the controller (not the request) so it returns a consistent JSON 422 response.

---

## 4. Policy

Add to `LeadPolicy`:

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

`update()` already encodes the rule: agents only on their assigned lead, managers on any lead.

---

## 5. Controller

**`App\Http\Controllers\Api\V1\LeadDocumentController`**

Three actions:

### `index(Lead $lead): JsonResponse`
- `authorize('view', $lead)`
- Returns `$lead->documents()->with('user')->latest()->get()`

### `store(StoreLeadDocumentRequest $request, Lead $lead): JsonResponse`
- `authorize('addDocument', $lead)`
- Count guard: if `$lead->documents()->count() >= 20` → 422 `{"message": "Lead has reached the 20 document limit"}`
- Upload via `CloudinaryService::uploadDocument()`
- Create `LeadDocument` row with `name = $file->getClientOriginalName()`, `mime_type`, `size`, `user_id = auth()->id()`
- Return 201

### `destroy(Lead $lead, LeadDocument $document): JsonResponse`
- `authorize('deleteDocument', $lead)`
- Cross-lead guard: if `$document->lead_id !== $lead->id` → 404
- `CloudinaryService::deleteMedia($document->public_id)`
- `$document->delete()`
- Return 200

No `update` endpoint — documents are immutable. Replace = delete + re-upload.

---

## 6. Routes

Added to the existing `role:agent,manager,super_admin` group under `admin` prefix, alongside the tasks routes:

```php
Route::get('leads/{lead}/documents', [LeadDocumentController::class, 'index']);
Route::post('leads/{lead}/documents', [LeadDocumentController::class, 'store']);
Route::delete('leads/{lead}/documents/{document}', [LeadDocumentController::class, 'destroy']);
```

---

## 7. Tests

File: `tests/Feature/Leads/LeadDocumentTest.php`

Mocking pattern: `$this->mock(CloudinaryService::class)` in tests that trigger uploads/deletes — same as `PropertyImageTest`.

| # | Test | Expected |
|---|---|---|
| 1 | Agent lists documents on assigned lead | 200, correct count |
| 2 | Agent cannot list documents on unassigned lead | 403 |
| 3 | Agent uploads document to assigned lead | 201, DB row created, mock called |
| 4 | Agent cannot upload to unassigned lead | 403 |
| 5 | Upload rejects disallowed mime type | 422 |
| 6 | Upload rejects file over 10 MB | 422 |
| 7 | Upload rejected when lead has 20 documents already | 422 |
| 8 | Agent deletes own document | 200, DB row gone, delete mock called |
| 9 | Cannot delete document from a different lead | 404 |
| 10 | Manager can upload on any lead | 201 |
| 11 | Manager can delete on any lead | 200 |

---

## Decisions & Constraints

- **No soft deletes on LeadDocument** — cascade delete from lead is sufficient; there's no restore flow for documents.
- **File types**: `pdf`, `doc`, `docx`, `jpg`, `jpeg`, `png` (validated server-side by Laravel before Cloudinary upload).
- **Size cap**: 10 MB per file (Laravel `max:10240`).
- **Count cap**: 20 documents per lead (enforced in controller).
- **Cloudinary folder**: `leads/documents`.
- **Auth**: identical to lead tasks — agents on assigned leads only, managers on any lead.
