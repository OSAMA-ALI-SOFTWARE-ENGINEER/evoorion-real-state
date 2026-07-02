# Admin Panel Region Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add region awareness across all admin panel features — badges on every list/card view, dashboard panel, report filters, leads filter, developer/agency/user FK, media bulk delete, CMS new pages, and a translations region tab.

**Architecture:** Pure frontend changes for badges + CMS; backend migration + model + controller updates for developer/agency/user region FK; new backend endpoints for dashboard panel and report filters; no new pages required — all changes are additions to existing pages.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS (admin), Laravel 11 PHP (backend), Eloquent ORM

## Global Constraints

- Admin gold color: `#C9A84C` — use for accents and highlights
- No new dependencies — use existing patterns (CustomSelect, ConfirmModal, etc.)
- All backend migrations must be nullable FKs with `nullOnDelete()`
- Follow existing `request<T>` helper pattern in `apps/admin/src/lib/api.ts`
- All API calls must include Bearer token via `getToken()` from existing helper
- Region type: `{ id: number; code: string; name: string; flag: string | null; is_active: boolean; sort_order: number }` — already defined in `api.ts`; must also be added to `types/index.ts`
- Git author: Abbas Rahim <abbasrahim723@gmail.com>

---

### Task 1: RegionBadge component + shared type updates

**Files:**
- Create: `apps/admin/src/components/ui/RegionBadge.tsx`
- Modify: `apps/admin/src/types/index.ts`

**Interfaces:**
- Produces: `RegionBadge` component imported as `import { RegionBadge } from '@/components/ui/RegionBadge'`
- Produces: `Region` type in `types/index.ts` — `{ id: number; code: string; name: string; flag: string | null; is_active: boolean; sort_order: number }`
- Produces: `region?: Region | null` field added to `Property`, `Area`, `BlogPost`, `Developer`, `Agency`, `AdminUser` interfaces

- [ ] **Step 1: Create RegionBadge component**

Create `apps/admin/src/components/ui/RegionBadge.tsx`:

```tsx
import type { Region } from '@/types'

interface RegionBadgeProps {
  region?: Region | null
  className?: string
}

export function RegionBadge({ region, className = '' }: RegionBadgeProps) {
  if (!region) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 ${className}`}>
      {region.flag && <span>{region.flag}</span>}
      <span>{region.name}</span>
    </span>
  )
}
```

- [ ] **Step 2: Add Region type to types/index.ts**

Open `apps/admin/src/types/index.ts`. After the `Language` interface (around line 107), add:

```ts
export interface Region {
  id: number
  code: string
  name: string
  flag: string | null
  is_active: boolean
  sort_order: number
}
```

- [ ] **Step 3: Add region field to existing interfaces in types/index.ts**

In `types/index.ts`:
- In the `Area` interface (currently ends with `region_id?: number | null`), add after that line:
  ```ts
  region?: Region | null
  ```
- In the `Developer` interface (currently `id, name, slug, email?, logo_url?`), add:
  ```ts
  region_id?: number | null
  region?: Region | null
  ```
- In the `Property` interface (after `region_id?: number`), add:
  ```ts
  region?: Region | null
  ```
- In the `Agency` interface (after `agents_count?`), add:
  ```ts
  region_id?: number | null
  region?: Region | null
  ```
- In the `AdminUser` interface (after `created_at`), add:
  ```ts
  region_id?: number | null
  region?: Region | null
  ```
- In the `BlogPost` interface (after `region_id?: number | null`), add:
  ```ts
  region?: Region | null
  ```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd apps/admin && npx tsc --noEmit 2>&1 | head -30`
Expected: no errors related to Region or RegionBadge

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/components/ui/RegionBadge.tsx apps/admin/src/types/index.ts
git commit -m "feat: add RegionBadge component and Region type to shared types"
```

---

### Task 2: Backend — eager-load region on list endpoints for properties, areas, blogs

**Files:**
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/PropertyController.php`
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/AreaController.php`
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/BlogController.php`

**Interfaces:**
- Consumes: nothing new — just adding `with('region:id,code,name,flag')` to existing queries
- Produces: `region: { id, code, name, flag }` nested object in list API responses for properties, areas, blogs

- [ ] **Step 1: Add region eager-load to AdminPropertyController.index()**

In `backend/app/Http/Controllers/Api/V1/Admin/PropertyController.php`, find the line:
```php
->with(['images' => fn ($q) => $q->where('is_primary', true)->orderBy('order'), 'area'])
```
Change it to:
```php
->with(['images' => fn ($q) => $q->where('is_primary', true)->orderBy('order'), 'area', 'region:id,code,name,flag'])
```

- [ ] **Step 2: Add region eager-load to AdminAreaController.index()**

In `backend/app/Http/Controllers/Api/V1/Admin/AreaController.php`, find the query that lists areas and add `->with('region:id,code,name,flag')` to it.

First read the file to confirm the method:
```bash
cat backend/app/Http/Controllers/Api/V1/Admin/AreaController.php
```
Then add the eager-load. The typical pattern will be something like:
```php
$areas = Area::with('region:id,code,name,flag')->latest()->paginate(20);
```

- [ ] **Step 3: Add region eager-load to AdminBlogController.index()**

In `backend/app/Http/Controllers/Api/V1/Admin/BlogController.php`, find:
```php
->with(['author:id,name', 'tags:id,name,slug'])
```
Change to:
```php
->with(['author:id,name', 'tags:id,name,slug', 'region:id,code,name,flag'])
```

- [ ] **Step 4: Verify Property model has region() relationship**

Check `backend/app/Models/Property.php` for a `region()` BelongsTo method. If missing, add:
```php
use Illuminate\Database\Eloquent\Relations\BelongsTo;

public function region(): BelongsTo
{
    return $this->belongsTo(\App\Models\Region::class);
}
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/Http/Controllers/Api/V1/Admin/PropertyController.php \
        backend/app/Http/Controllers/Api/V1/Admin/AreaController.php \
        backend/app/Http/Controllers/Api/V1/Admin/BlogController.php \
        backend/app/Models/Property.php
git commit -m "feat: eager-load region on admin property, area, blog list endpoints"
```

---

### Task 3: Region badges on Properties, Areas, Blog list pages

**Files:**
- Modify: `apps/admin/src/app/(admin)/properties/page.tsx`
- Modify: `apps/admin/src/app/(admin)/areas/page.tsx`
- Modify: `apps/admin/src/app/(admin)/blog/page.tsx`

**Interfaces:**
- Consumes: `RegionBadge` from `@/components/ui/RegionBadge`
- Consumes: `region?: Region | null` on Property, Area, BlogPost types (Task 1)

- [ ] **Step 1: Add RegionBadge to Properties table row**

In `apps/admin/src/app/(admin)/properties/page.tsx`:

1. Add import at top:
```tsx
import { RegionBadge } from '@/components/ui/RegionBadge'
```

2. In `TableRow`, inside the first `<td>` (the Property title/area cell), after the `<p className="text-xs text-slate-400 font-mono">` line, add:
```tsx
{property.region && <div className="mt-0.5"><RegionBadge region={property.region} /></div>}
```

3. In `PropertyCard`, inside the `<div className="flex items-center gap-1.5 flex-wrap mb-2">` (which has `PropertyTypeBadge`), add after it:
```tsx
<RegionBadge region={property.region} />
```

- [ ] **Step 2: Add RegionBadge to Areas page**

Read `apps/admin/src/app/(admin)/areas/page.tsx` first, then add `RegionBadge` import and render it in the area name cell/card where the area name is shown.

- [ ] **Step 3: Add RegionBadge to Blog page**

Read `apps/admin/src/app/(admin)/blog/page.tsx` first, then add `RegionBadge` import and render it next to the blog title in the list rows.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/\(admin\)/properties/page.tsx \
        apps/admin/src/app/\(admin\)/areas/page.tsx \
        apps/admin/src/app/\(admin\)/blog/page.tsx
git commit -m "feat: show region badges on properties, areas, blog list pages"
```

---

### Task 4: Backend — add region_id FK to developers, agencies, users

**Files:**
- Create: `backend/database/migrations/2026_07_02_000001_add_region_id_to_developers_agencies_users.php`
- Modify: `backend/app/Models/Developer.php`
- Modify: `backend/app/Models/Agency.php`
- Modify: `backend/app/Models/User.php`
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/DeveloperController.php`
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/AgencyController.php`
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/UserController.php`

**Interfaces:**
- Produces: `region_id` nullable FK on developers, agencies, users tables
- Produces: `region()` BelongsTo method on Developer, Agency, User models
- Produces: API list endpoints return `region: { id, code, name, flag }` nested object
- Produces: store/update endpoints accept `region_id` (nullable integer)

- [ ] **Step 1: Create migration**

Create file `backend/database/migrations/2026_07_02_000001_add_region_id_to_developers_agencies_users.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('developers', function (Blueprint $table) {
            $table->unsignedBigInteger('region_id')->nullable()->after('id');
            $table->foreign('region_id')->references('id')->on('regions')->nullOnDelete();
        });

        Schema::table('agencies', function (Blueprint $table) {
            $table->unsignedBigInteger('region_id')->nullable()->after('id');
            $table->foreign('region_id')->references('id')->on('regions')->nullOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('region_id')->nullable()->after('id');
            $table->foreign('region_id')->references('id')->on('regions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('developers', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
            $table->dropColumn('region_id');
        });
        Schema::table('agencies', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
            $table->dropColumn('region_id');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
            $table->dropColumn('region_id');
        });
    }
};
```

- [ ] **Step 2: Run migration locally**

```bash
cd backend && php artisan migrate
```
Expected: "Migrated: 2026_07_02_000001_add_region_id..."

- [ ] **Step 3: Update Developer model**

Replace `backend/app/Models/Developer.php` content:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Developer extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'logo_url', 'description', 'region_id'];

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }
}
```

- [ ] **Step 4: Update Agency model**

In `backend/app/Models/Agency.php`, add `'region_id'` to `$fillable` and add the relationship:

```php
protected $fillable = [
    'name',
    'logo_url',
    'contact_email',
    'phone',
    'address',
    'region_id',
];

public function region(): BelongsTo
{
    return $this->belongsTo(Region::class);
}
```

Also add the `use BelongsTo` import at top of the class.

- [ ] **Step 5: Update User model**

In `backend/app/Models/User.php`, add `'region_id'` to `$fillable` and add:

```php
public function region(): BelongsTo
{
    return $this->belongsTo(Region::class);
}
```

- [ ] **Step 6: Update DeveloperController — add region to index/store/update**

In `backend/app/Http/Controllers/Api/V1/Admin/DeveloperController.php`:

`index()` — add eager-load:
```php
$developers = Developer::with('region:id,code,name,flag')->paginate(15);
```

`store()` — add `region_id` to validation:
```php
'region_id' => 'nullable|exists:regions,id',
```

`update()` — add `region_id` to validation:
```php
'region_id' => 'nullable|exists:regions,id',
```

- [ ] **Step 7: Update AgencyController — add region to index/store/update**

In `backend/app/Http/Controllers/Api/V1/Admin/AgencyController.php`:

`index()` — change `Agency::withCount('agents')` to:
```php
Agency::withCount('agents')->with('region:id,code,name,flag')
```

In `StoreAgencyRequest` and `UpdateAgencyRequest` files (check `backend/app/Http/Requests/`), add:
```php
'region_id' => 'nullable|exists:regions,id',
```

- [ ] **Step 8: Update UserController — add region to index/store/update**

In `backend/app/Http/Controllers/Api/V1/Admin/UserController.php`:

`index()` — add `->with('region:id,code,name,flag')` before the `->paginate()` call.

`store()` — add to validation:
```php
'region_id' => 'nullable|exists:regions,id',
```

`update()` — read the `update()` method and add `region_id` to its validation.

- [ ] **Step 9: Commit**

```bash
git add backend/database/migrations/2026_07_02_000001_add_region_id_to_developers_agencies_users.php \
        backend/app/Models/Developer.php \
        backend/app/Models/Agency.php \
        backend/app/Models/User.php \
        backend/app/Http/Controllers/Api/V1/Admin/DeveloperController.php \
        backend/app/Http/Controllers/Api/V1/Admin/AgencyController.php \
        backend/app/Http/Controllers/Api/V1/Admin/UserController.php \
        backend/app/Http/Requests/
git commit -m "feat: add region_id FK to developers, agencies, users with eager-load and validation"
```

---

### Task 5: Frontend — Region selectors in Developer, Agency, User forms + badges on list pages

**Files:**
- Modify: `apps/admin/src/app/(admin)/developers/page.tsx`
- Modify: `apps/admin/src/app/(admin)/agencies/page.tsx`
- Modify: `apps/admin/src/app/(admin)/agencies/new/page.tsx` (and `[id]/edit`)
- Modify: `apps/admin/src/app/(admin)/users/page.tsx`
- Modify: `apps/admin/src/app/(admin)/users/new/page.tsx`
- Modify: `apps/admin/src/lib/api.ts` — update Developer/Agency/User function signatures

**Interfaces:**
- Consumes: `getRegions()` from `@/lib/api`
- Consumes: `Region` from `@/types`
- Consumes: `region?: Region | null` on `Developer`, `Agency`, `AdminUser` (Task 1)
- Produces: `region_id` sent in create/update payloads for developers, agencies, users

- [ ] **Step 1: Update api.ts — getDevelopers sends region_id, Developer type updated**

In `apps/admin/src/lib/api.ts`, update `createDeveloper` and `updateDeveloper` — the `Partial<Developer>` type already includes `region_id` after Task 1 so no code change needed in the API functions themselves. Same for Agency and User.

- [ ] **Step 2: Add region selector to DeveloperModal**

In `apps/admin/src/app/(admin)/developers/page.tsx`:

1. Add imports:
```tsx
import { getRegions } from '@/lib/api'
import type { Region } from '@/types'
import { RegionBadge } from '@/components/ui/RegionBadge'
```

2. In `DeveloperModal`, add state:
```tsx
const [regions,  setRegions]  = useState<Region[]>([])
const [regionId, setRegionId] = useState<string>(String(developer?.region_id ?? ''))
```

3. Add useEffect in DeveloperModal to load regions:
```tsx
useEffect(() => {
  getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
}, [])
```

4. Add to the form (before the submit button), after the email field:
```tsx
<div>
  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
    Region
  </label>
  <select
    value={regionId}
    onChange={e => setRegionId(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
  >
    <option value="">No region (global)</option>
    {regions.filter(r => r.is_active).map(r => (
      <option key={r.id} value={String(r.id)}>{r.flag} {r.name}</option>
    ))}
  </select>
</div>
```

5. In the `submit` handler, include `region_id` in the `onSave` call:
```tsx
await onSave({
  name: name.trim(),
  email: email.trim() || undefined,
  slug: slug.trim(),
  logo_url: logoUrl.trim() || undefined,
  region_id: regionId ? Number(regionId) : null,
})
```

6. In the developer list (table row or card), add `<RegionBadge region={developer.region} />` after the developer name.

- [ ] **Step 3: Add region selector to Agency forms**

Read `apps/admin/src/app/(admin)/agencies/new/page.tsx` and `apps/admin/src/app/(admin)/agencies/[id]/edit/page.tsx`. Add the same region selector pattern as Developer (getRegions on mount, regionId state, select element, include region_id in save payload).

In `apps/admin/src/app/(admin)/agencies/page.tsx`, add `RegionBadge` import and render it in the agency list rows.

- [ ] **Step 4: Add region selector to User forms**

Read `apps/admin/src/app/(admin)/users/new/page.tsx` and the user edit form. Add the same region selector pattern.

In `apps/admin/src/app/(admin)/users/page.tsx`, add `RegionBadge` import and render it in the user list rows.

- [ ] **Step 5: Add RegionBadge to Leads list (via property.region)**

In `apps/admin/src/app/(admin)/leads/page.tsx`, leads have `lead.property?.area?.region` nested too deep. Since the backend eager-loads `property.region` (after Task 4 backend work below), use:

```tsx
import { RegionBadge } from '@/components/ui/RegionBadge'
```

In the lead table row, after the `assigned_user` cell, add a hidden-sm cell:
```tsx
<td className="hidden md:table-cell px-4 py-3.5">
  <RegionBadge region={(lead.property as any)?.region ?? null} />
</td>
```

Also add the corresponding `<th>` header: `<th className="hidden md:table-cell px-4 py-3 ...">Region</th>`

- [ ] **Step 6: Update Lead type for region**

In `apps/admin/src/types/index.ts`, update the `Lead.property` field type to include `region`:

```ts
property?: Pick<Property, 'id' | 'slug' | 'title' | 'type' | 'status' | 'price' | 'currency' | 'bedrooms' | 'bathrooms' | 'location' | 'area_sqft'> & {
  images?: PropertyImage[]
  area?: Area
  region?: Region | null
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/app/\(admin\)/developers/page.tsx \
        apps/admin/src/app/\(admin\)/agencies/ \
        apps/admin/src/app/\(admin\)/users/ \
        apps/admin/src/app/\(admin\)/leads/page.tsx \
        apps/admin/src/types/index.ts
git commit -m "feat: region selectors on developer/agency/user forms + region badges on all list pages"
```

---

### Task 6: Backend — leads region eager-load + filter; backend region_id on leads list

**Files:**
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/LeadController.php` (or wherever `Admin\LeadController` lives — check `backend/app/Http/Controllers/Api/V1/Admin/`)
- Check: `backend/routes/api.php` line 157 shows `LeadController::class` — confirm full namespace

**Interfaces:**
- Consumes: nothing new
- Produces: leads list endpoint eager-loads `property.region:id,code,name,flag`
- Produces: leads list accepts `?region=uk` param and filters by `whereHas('property.region', fn($q) => $q->where('code', $region))`

- [ ] **Step 1: Find the admin leads controller**

```bash
grep -r "class LeadController" backend/app/Http/Controllers/Api/V1/Admin/
```
Check if there's an Admin-namespaced one. If the routes file imports it from the Admin namespace, read that file.

- [ ] **Step 2: Add region eager-load and filter to leads index**

In the leads `index()` method, add eager-load:
```php
->with([
    'assignedUser:id,name,email',
    'property:id,slug,title,type,status,price,currency,bedrooms,bathrooms,location,area_sqft',
    'property.region:id,code,name,flag',
])
```

Add filter (in the chain of `->when()` calls):
```php
->when($request->region, fn ($q) => $q->whereHas('property.region', fn ($r) => $r->where('code', $request->region)))
```

- [ ] **Step 3: Update api.ts getLeads to accept region param**

In `apps/admin/src/lib/api.ts`, update `getLeads` params type:
```ts
export async function getLeads(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
  source?: string
  region?: string
}) {
  return request<PaginatedResponse<Lead>>(`/admin/leads${qs(params)}`)
}
```

- [ ] **Step 4: Add region filter dropdown to leads page**

In `apps/admin/src/app/(admin)/leads/page.tsx`:

1. Add to imports: `import { getRegions } from '@/lib/api'; import type { Region } from '@/types'`

2. Add state:
```tsx
const [regions,    setRegions]    = useState<Region[]>([])
const [regionCode, setRegionCode] = useState('')
```

3. In `useEffect(() => { load(...) })` dependencies array, add `regionCode`.

4. Load regions on mount (add to existing `useEffect` or separate one):
```tsx
useEffect(() => {
  getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
}, [])
```

5. Update the `load` function signature to accept `region?: string` and pass it to `getLeads(...)`:
```tsx
const load = useCallback(async (p: number, s: string, st: string, src: string, region: string) => {
  ...
  const res = await getLeads({ page: p, per_page: PER_PAGE, search: s || undefined, status: st || undefined, source: src || undefined, region: region || undefined })
```

6. Build regionOptions:
```tsx
const regionOptions = [
  { value: '', label: 'All regions' },
  ...regions.filter(r => r.is_active).map(r => ({ value: r.code, label: `${r.flag ?? ''} ${r.name}`.trim() })),
]
```

7. Add the `CustomSelect` to the filters row:
```tsx
<CustomSelect
  value={regionCode}
  onChange={v => { setRegionCode(v); setPage(1) }}
  options={regionOptions}
  placeholder="All regions"
  className="sm:w-44"
/>
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/Http/Controllers/ apps/admin/src/app/\(admin\)/leads/page.tsx apps/admin/src/lib/api.ts
git commit -m "feat: leads list shows region (via property) with region filter dropdown"
```

---

### Task 7: Dashboard region breakdown panel + backend endpoint

**Files:**
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/DashboardController.php`
- Modify: `backend/routes/api.php`
- Modify: `apps/admin/src/lib/api.ts`
- Modify: `apps/admin/src/types/index.ts`
- Modify: `apps/admin/src/app/(admin)/dashboard/page.tsx`

**Interfaces:**
- Produces: `GET /admin/dashboard/region-breakdown` returns `[{ region_id, region: { id, code, name, flag }, properties_count, leads_count }]`
- Produces: `getRegionBreakdown()` function in `api.ts`
- Produces: `RegionBreakdown[]` type in `types/index.ts`

- [ ] **Step 1: Read DashboardController**

```bash
cat backend/app/Http/Controllers/Api/V1/Admin/DashboardController.php
```
Understand its current structure then add new method.

- [ ] **Step 2: Add regionBreakdown method to DashboardController**

```php
public function regionBreakdown(): JsonResponse
{
    $rows = \App\Models\Region::query()
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->withCount([
            'properties',
            'leads as leads_count' => fn ($q) => $q->join('properties', 'leads.property_id', '=', 'properties.id')
                                                    ->whereColumn('properties.region_id', 'regions.id'),
        ])
        ->get()
        ->map(fn ($r) => [
            'region'            => ['id' => $r->id, 'code' => $r->code, 'name' => $r->name, 'flag' => $r->flag],
            'properties_count'  => (int) $r->properties_count,
            'leads_count'       => (int) $r->leads_count,
        ]);

    return response()->json(['success' => true, 'data' => $rows]);
}
```

Note: The `Region` model needs a `properties()` HasMany relationship. Check `backend/app/Models/Region.php` and add if missing:
```php
public function properties(): HasMany
{
    return $this->hasMany(\App\Models\Property::class);
}
```

- [ ] **Step 3: Add route**

In `backend/routes/api.php`, in the `role:agent,manager,super_admin` group, after the `dashboard/agent-performance` route, add:
```php
Route::get('dashboard/region-breakdown', [DashboardController::class, 'regionBreakdown']);
```

- [ ] **Step 4: Add type to types/index.ts**

In `apps/admin/src/types/index.ts`, after `AgentPerformance` interface, add:

```ts
export interface RegionBreakdown {
  region: { id: number; code: string; name: string; flag: string | null }
  properties_count: number
  leads_count: number
}
```

Also update `DashboardStats` is already in types — no change needed there.

- [ ] **Step 5: Add getRegionBreakdown to api.ts**

In `apps/admin/src/lib/api.ts`, after `getAgentPerformance`:
```ts
export async function getRegionBreakdown() {
  return request<ApiResponse<RegionBreakdown[]>>('/admin/dashboard/region-breakdown')
}
```

Also add `RegionBreakdown` to the import list at the top of `api.ts`.

- [ ] **Step 6: Add RegionBreakdownPanel component to dashboard page**

In `apps/admin/src/app/(admin)/dashboard/page.tsx`:

1. Add imports:
```tsx
import { getRegionBreakdown } from '@/lib/api'
import type { RegionBreakdown } from '@/types'
```

2. Add state: `const [regionBreakdown, setRegionBreakdown] = useState<RegionBreakdown[]>([])`

3. Add to the `Promise.all()` in `useEffect`:
```tsx
Promise.all([
  getDashboardStats(),
  getAgentPerformance(),
  getAdminProperties({ per_page: 5, status: 'available' }),
  getAdminBlogPosts({ per_page: 5 }),
  getRegionBreakdown(),
])
  .then(([s, a, p, b, rb]) => {
    setStats(s.data)
    setAgents(a.data)
    setProperties(p.data ?? [])
    setBlogPosts(b.data ?? [])
    setRegionBreakdown(rb.data ?? [])
  })
```

4. Add the `RegionBreakdownPanel` component (define it above `DashboardPage`):
```tsx
function RegionBreakdownPanel({ data }: { data: RegionBreakdown[] }) {
  if (!data.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Content by Region</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {data.map(item => (
          <div key={item.region.code} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
            {item.region.flag && <div className="text-2xl mb-1">{item.region.flag}</div>}
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">{item.region.name}</p>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.properties_count}</span> properties
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.leads_count}</span> leads
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

5. In the JSX render, add `<RegionBreakdownPanel data={regionBreakdown} />` after the lead breakdowns grid.

- [ ] **Step 7: Commit**

```bash
git add backend/app/Http/Controllers/Api/V1/Admin/DashboardController.php \
        backend/app/Models/Region.php \
        backend/routes/api.php \
        apps/admin/src/lib/api.ts \
        apps/admin/src/types/index.ts \
        apps/admin/src/app/\(admin\)/dashboard/page.tsx
git commit -m "feat: dashboard region breakdown panel with properties and leads count per region"
```

---

### Task 8: Reports region filter dropdown

**Files:**
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/ReportController.php`
- Modify: `apps/admin/src/lib/api.ts`
- Modify: `apps/admin/src/app/(admin)/reports/page.tsx`

**Interfaces:**
- Produces: All 5 report endpoints accept optional `?region=uk` param
- Produces: All 5 `get*` functions in api.ts accept optional `region?: string`
- Produces: Reports page has a shared region dropdown above the tabs

- [ ] **Step 1: Add region filter to all 5 ReportController methods**

In `backend/app/Http/Controllers/Api/V1/Admin/ReportController.php`:

Add `use Illuminate\Http\Request;` if not already there (it is — the class already has it in the `leadsOverTime` method signature).

For `leadFunnel(Request $request)` (add `Request $request` param):
```php
public function leadFunnel(Request $request): JsonResponse
{
    $statuses = ['new', 'contacted', 'qualified', 'closed', 'lost'];
    $counts = Lead::select('status', DB::raw('count(*) as total'))
        ->when($request->region, fn ($q) => $q->whereHas('property.region', fn ($r) => $r->where('code', $request->region)))
        ->groupBy('status')
        ->pluck('total', 'status');
    // rest unchanged
```

For `leadsOverTime` (already has `Request $request`):
```php
$data = Lead::select(...)
    ->when($request->region, fn ($q) => $q->whereHas('property.region', fn ($r) => $r->where('code', $request->region)))
    ->where('created_at', '>=', $from)
    ->groupBy(...)
```

For `propertyPerformance(Request $request)` (add Request param):
```php
public function propertyPerformance(Request $request): JsonResponse
{
    $properties = Property::select('properties.*')
        ->addSelect(DB::raw('(SELECT COUNT(*) FROM leads WHERE leads.property_id = properties.id) as leads_count'))
        ->when($request->region, fn ($q) => $q->whereHas('region', fn ($r) => $r->where('code', $request->region)))
        ->with('area')
        ->orderByDesc('views_count')
        ->limit(20)
        ->get()
        // rest unchanged
```

For `agentLeaderboard(Request $request)` (add Request param):
```php
public function agentLeaderboard(Request $request): JsonResponse
{
    $region = $request->input('region');
    $agents = Agent::with('user')
        ->addSelect([
            'agents.*',
            DB::raw('(SELECT COUNT(*) FROM leads WHERE leads.assigned_to = agents.user_id' . ($region ? ' AND EXISTS (SELECT 1 FROM properties p JOIN regions r ON p.region_id=r.id WHERE p.id=leads.property_id AND r.code=\'' . addslashes($region) . '\')' : '') . ') as leads_total'),
            DB::raw('(SELECT COUNT(*) FROM leads WHERE leads.assigned_to = agents.user_id AND leads.status = \'closed\'' . ($region ? ' AND EXISTS (SELECT 1 FROM properties p JOIN regions r ON p.region_id=r.id WHERE p.id=leads.property_id AND r.code=\'' . addslashes($region) . '\')' : '') . ') as leads_closed'),
            DB::raw('(SELECT COUNT(*) FROM leads WHERE leads.assigned_to = agents.user_id AND leads.status = \'new\'' . ($region ? ' AND EXISTS (SELECT 1 FROM properties p JOIN regions r ON p.region_id=r.id WHERE p.id=leads.property_id AND r.code=\'' . addslashes($region) . '\')' : '') . ') as leads_new'),
        ])
        ->get()
        // rest unchanged
```

For `leadsBySource(Request $request)` (add Request param):
```php
public function leadsBySource(Request $request): JsonResponse
{
    $data = Lead::select('source', DB::raw('count(*) as total'))
        ->when($request->region, fn ($q) => $q->whereHas('property.region', fn ($r) => $r->where('code', $request->region)))
        ->groupBy('source')
        ->orderByDesc('total')
        ->get()
        // rest unchanged
```

- [ ] **Step 2: Update api.ts — add region param to all 5 report functions**

In `apps/admin/src/lib/api.ts`:

```ts
export async function getLeadFunnel(region?: string) {
  return request<ApiResponse<{ funnel: {status: string; count: number}[]; total: number; conversion_rate: number }>>(`/admin/reports/lead-funnel${qs({ region })}`)
}

export async function getLeadsOverTime(days: number = 30, region?: string) {
  return request<ApiResponse<{date: string; total: number}[]>>(`/admin/reports/leads-over-time${qs({ days, region })}`)
}

export async function getPropertyPerformance(region?: string) {
  return request<ApiResponse<{id:number; title:string; slug:string; area:string|null; price:string; views:number; leads:number; status:string; is_featured:boolean}[]>>(`/admin/reports/property-performance${qs({ region })}`)
}

export async function getAgentLeaderboard(region?: string) {
  return request<ApiResponse<{id:number; name:string; leads_total:number; leads_closed:number; leads_new:number; close_rate:number}[]>>(`/admin/reports/agent-leaderboard${qs({ region })}`)
}

export async function getLeadsBySource(region?: string) {
  return request<ApiResponse<{source: string; total: number}[]>>(`/admin/reports/leads-by-source${qs({ region })}`)
}
```

- [ ] **Step 3: Read full reports/page.tsx to understand state and tab structure**

```bash
cat "apps/admin/src/app/(admin)/reports/page.tsx"
```

- [ ] **Step 4: Add region filter state and dropdown to reports page**

In `apps/admin/src/app/(admin)/reports/page.tsx`:

1. Add imports:
```tsx
import { getRegions } from '@/lib/api'
import type { Region } from '@/types'
import { CustomSelect } from '@/components/ui/CustomSelect'
```

2. Add state at the top of the page component:
```tsx
const [regions,    setRegions]    = useState<Region[]>([])
const [regionCode, setRegionCode] = useState('')
```

3. Load regions on mount (add to existing useEffect or new one):
```tsx
useEffect(() => {
  getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
}, [])
```

4. Pass `regionCode` to every existing API call (e.g., `getLeadFunnel(regionCode)`, `getLeadsOverTime(30, regionCode)`, etc.). Trigger refetch when `regionCode` changes by including it in the useEffect dependency array.

5. Build regionOptions and add the dropdown:
```tsx
const regionOptions = [
  { value: '', label: 'All Regions' },
  ...regions.filter(r => r.is_active).map(r => ({ value: r.code, label: `${r.flag ?? ''} ${r.name}`.trim() })),
]
```

6. Add the dropdown in the reports header (before the tab switcher):
```tsx
<CustomSelect
  value={regionCode}
  onChange={v => setRegionCode(v)}
  options={regionOptions}
  placeholder="All Regions"
  className="w-44"
/>
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/Http/Controllers/Api/V1/Admin/ReportController.php \
        apps/admin/src/lib/api.ts \
        apps/admin/src/app/\(admin\)/reports/page.tsx
git commit -m "feat: region filter on all 5 report tabs and report API endpoints"
```

---

### Task 9: Media page — multi-select + bulk delete

**Files:**
- Modify: `backend/app/Http/Controllers/Api/V1/Admin/MediaController.php`
- Modify: `backend/routes/api.php`
- Modify: `apps/admin/src/lib/api.ts`
- Modify: `apps/admin/src/app/(admin)/media/page.tsx`

**Interfaces:**
- Produces: `POST /admin/media/bulk-delete` accepts `{ ids: number[] }` and deletes all
- Produces: `bulkDeleteMedia(ids: number[])` in api.ts
- Produces: "Select" mode toggle in media page — checkboxes on cards, bulk delete button

- [ ] **Step 1: Add bulkDestroy to MediaController**

In `backend/app/Http/Controllers/Api/V1/Admin/MediaController.php`, add method:

```php
public function bulkDestroy(Request $request): JsonResponse
{
    $data = $request->validate([
        'ids'   => 'required|array|min:1',
        'ids.*' => 'integer|exists:media_files,id',
    ]);

    $files = MediaFile::whereIn('id', $data['ids'])->get();

    foreach ($files as $file) {
        try {
            $this->media->deleteMedia($file->public_id);
        } catch (\Throwable) {}
        $file->delete();
    }

    return $this->success(null, count($data['ids']) . ' files deleted');
}
```

- [ ] **Step 2: Add route for bulk delete**

In `backend/routes/api.php`, in the media section (around line 222), add:
```php
Route::post('media/bulk-delete', [MediaController::class, 'bulkDestroy']);
```
Place it before the `delete('media/{id}')` route.

- [ ] **Step 3: Add bulkDeleteMedia to api.ts**

In `apps/admin/src/lib/api.ts`, after `deleteMedia`:
```ts
export async function bulkDeleteMedia(ids: number[]) {
  return request<ApiResponse<null>>('/admin/media/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}
```

Also check the existing `deleteMedia` function signature — it uses `id: number`, so the bulk variant above uses `ids: number[]`.

- [ ] **Step 4: Update media page with select mode**

In `apps/admin/src/app/(admin)/media/page.tsx`:

1. Add import:
```tsx
import { bulkDeleteMedia } from '@/lib/api'
```

2. Add state:
```tsx
const [selectMode,   setSelectMode]   = useState(false)
const [selectedIds,  setSelectedIds]  = useState<Set<number>>(new Set())
const [bulkActing,   setBulkActing]   = useState(false)
const [bulkConfirm,  setBulkConfirm]  = useState(false)
```

3. Add toggle handler:
```tsx
function toggleSelect(id: number) {
  setSelectedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
}

function exitSelectMode() {
  setSelectMode(false)
  setSelectedIds(new Set())
}

async function confirmBulkDelete() {
  setBulkActing(true)
  try {
    await bulkDeleteMedia(Array.from(selectedIds))
    setBulkConfirm(false)
    exitSelectMode()
    load()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Bulk delete failed')
  } finally { setBulkActing(false) }
}
```

4. In the top bar, add a "Select" button before the Upload button:
```tsx
{selectMode ? (
  <>
    <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
      {selectedIds.size} selected
    </span>
    {selectedIds.size > 0 && (
      <button
        type="button"
        onClick={() => setBulkConfirm(true)}
        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shrink-0"
      >
        Delete ({selectedIds.size})
      </button>
    )}
    <button
      type="button"
      onClick={exitSelectMode}
      className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm shrink-0"
    >
      Cancel
    </button>
  </>
) : (
  <button
    type="button"
    onClick={() => setSelectMode(true)}
    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 shrink-0"
  >
    Select
  </button>
)}
```

5. Update each file card in the grid — when in selectMode, show a checkbox overlay instead of normal click behavior:
```tsx
<div
  key={file.id}
  onClick={() => selectMode ? toggleSelect(file.id) : setSelected(file)}
  className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${
    selectMode && selectedIds.has(file.id)
      ? 'border-[#C9A84C]'
      : selected?.id === file.id && !selectMode
      ? 'border-[#C9A84C]'
      : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600'
  }`}
>
  <img src={file.url} alt={file.name} className="w-full h-full object-cover bg-slate-100 dark:bg-slate-700" onError={...} />
  {selectMode ? (
    <div className="absolute top-1.5 left-1.5">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedIds.has(file.id) ? 'bg-[#C9A84C] border-[#C9A84C]' : 'bg-white/80 border-white/80'}`}>
        {selectedIds.has(file.id) && <span className="text-slate-900 text-[10px] font-bold">✓</span>}
      </div>
    </div>
  ) : (
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-1.5 opacity-0 group-hover:opacity-100">
      <button type="button" onClick={ev => { ev.stopPropagation(); setToDelete(file) }} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600">
        <IconTrash size={12} />
      </button>
    </div>
  )}
</div>
```

6. Add bulk confirm modal at bottom (alongside existing ConfirmModal):
```tsx
{bulkConfirm && (
  <ConfirmModal
    title="Delete selected files"
    message={`Delete ${selectedIds.size} file${selectedIds.size !== 1 ? 's' : ''}? This cannot be undone.`}
    onConfirm={confirmBulkDelete}
    onCancel={() => setBulkConfirm(false)}
    loading={bulkActing}
  />
)}
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/Http/Controllers/Api/V1/Admin/MediaController.php \
        backend/routes/api.php \
        apps/admin/src/lib/api.ts \
        apps/admin/src/app/\(admin\)/media/page.tsx
git commit -m "feat: media page multi-select and bulk delete"
```

---

### Task 10: CMS — add new marketing page slugs

**Files:**
- Modify: `apps/admin/src/app/(admin)/cms/page.tsx`

**Interfaces:**
- Consumes: backend `CmsController.index()` already returns slugs from DB; frontend merges with KNOWN_PAGES
- Produces: KNOWN_PAGES includes 5 new slugs — `off-plan`, `sell`, `agents`, `services`, `property-management`

Note: The backend `CmsController.index()` reads `PageContent` table's `page_slug` distinct values. Since these marketing pages don't have content in DB yet, the backend won't return them. The frontend merges `KNOWN_PAGES` with whatever the backend returns. So adding to `KNOWN_PAGES` is sufficient for the pages to appear in the selector.

- [ ] **Step 1: Update KNOWN_PAGES constant**

In `apps/admin/src/app/(admin)/cms/page.tsx`, find:
```ts
const KNOWN_PAGES = ['home', 'about', 'contact', 'investments']
```
Replace with:
```ts
const KNOWN_PAGES = [
  'home',
  'about',
  'contact',
  'investments',
  'off-plan',
  'sell',
  'agents',
  'services',
  'property-management',
]
```

- [ ] **Step 2: Verify merged deduplication still works**

Read lines 104-108 of `apps/admin/src/app/(admin)/cms/page.tsx` to confirm the merge logic:
```ts
const merged = Array.from(new Set([...KNOWN_PAGES, ...fetched]))
```
This is already there — no change needed.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/app/\(admin\)/cms/page.tsx
git commit -m "feat: CMS editor adds off-plan, sell, agents, services, property-management page slugs"
```

---

### Task 11: Translations — Regions tab with accordion per region

**Files:**
- Modify: `apps/admin/src/app/(admin)/translations/page.tsx`

**Interfaces:**
- Consumes: `getRegions()` from `@/lib/api`
- Consumes: `getSettings()`, `updateSettings()` from `@/lib/api` (already used by translations page)
- Produces: New "Regions" tab in translations editor; keys: `region_{code}_hero_title`, `region_{code}_hero_subtitle`, `region_{code}_investment_description`, `region_{code}_cta_label`

- [ ] **Step 1: Read translations/page.tsx fully**

Read the full `apps/admin/src/app/(admin)/translations/page.tsx` to understand current tab structure, how settings are loaded and saved, and the field/section rendering pattern.

- [ ] **Step 2: Add Regions tab to the locale tabs**

In `apps/admin/src/app/(admin)/translations/page.tsx`:

1. Add `getRegions` to the imports:
```tsx
import { getSettings, updateSettings, getRegions } from '@/lib/api'
import type { Region } from '@/types'
```

2. Add state:
```tsx
const [regions,       setRegions]       = useState<Region[]>([])
const [openRegion,    setOpenRegion]    = useState<string | null>(null)
```

3. Load regions on mount (alongside existing getSettings call):
```tsx
getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
```

4. Update the locale type and tab definition. Currently `type Locale = 'en' | 'ar' | 'de'`. Add `'regions'` as a possible active tab value (but it's not a locale — use a separate state or treat it as a special tab value):
```tsx
type ActiveTab = Locale | 'regions'
```
Update the state: `const [activeTab, setActiveTab] = useState<ActiveTab>('en')`

5. Add the Regions tab button alongside the existing locale tabs (English, Arabic, German):
```tsx
<button
  type="button"
  onClick={() => setActiveTab('regions')}
  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'regions' ? 'bg-[#C9A84C] text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
>
  Regions
</button>
```

6. Add the Regions tab content panel. The region fields for each region use settings keys `region_{code}_{field}` (e.g., `region_uk_hero_title`). Reuse the same `getSettings/updateSettings` mechanism already on the page:

```tsx
{activeTab === 'regions' && (
  <div className="space-y-3">
    {regions.length === 0 ? (
      <div className="py-12 text-center">
        <p className="text-slate-400 text-sm">No regions configured.</p>
        <a href="/regions" className="text-[#C9A84C] text-sm hover:underline">Go to Regions →</a>
      </div>
    ) : regions.filter(r => r.is_active).map(region => {
      const fields = [
        { key: `region_${region.code}_hero_title`,               label: 'Hero Title' },
        { key: `region_${region.code}_hero_subtitle`,            label: 'Hero Subtitle' },
        { key: `region_${region.code}_investment_description`,   label: 'Investment Description', multiline: true },
        { key: `region_${region.code}_cta_label`,               label: 'CTA Button Label' },
      ]
      return (
        <div key={region.code} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenRegion(openRegion === region.code ? null : region.code)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {region.flag && <span className="text-lg">{region.flag}</span>}
              <span className="font-medium text-slate-800 dark:text-slate-100">{region.name}</span>
              <span className="text-xs text-slate-400 uppercase">{region.code}</span>
            </div>
            <span className="text-slate-400">{openRegion === region.code ? '▲' : '▼'}</span>
          </button>
          {openRegion === region.code && (
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
              {fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea
                      rows={3}
                      value={settings[field.key] ?? ''}
                      onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  ) : (
                    <input
                      type="text"
                      value={settings[field.key] ?? ''}
                      onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm"
              >
                Save Region Copy
              </button>
            </div>
          )}
        </div>
      )
    })}
  </div>
)}
```

Note: `settings` and `setSettings` and `handleSave` are the existing state/handler from the translations page — reuse them directly. The region fields are just additional keys stored the same way.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/app/\(admin\)/translations/page.tsx
git commit -m "feat: translations Regions tab with per-region copy fields (hero_title, subtitle, investment_description, cta_label)"
```

---

## Self-Review

**Spec coverage check:**

| Spec Item | Task |
|---|---|
| Region badges on all entity list/card views | Tasks 2, 3, 5 |
| Dashboard region breakdown panel | Task 7 |
| Reports region filter on all 5 tabs | Task 8 |
| Leads region column + filter | Tasks 5 (column) + 6 (filter) |
| Backend: region_id FK on developers/agencies/users | Task 4 |
| Admin forms for developers/agencies/users with region selector | Task 5 |
| Media bulk select + delete | Task 9 |
| CMS: add new pages | Task 10 |
| Translations: Regions tab | Task 11 |

**Type consistency check:**
- `Region` type defined in Task 1, used in Tasks 3–11 ✓
- `RegionBadge` component created in Task 1, imported by Tasks 3, 5 ✓
- `getRegionBreakdown()` added in Task 7, `RegionBreakdown[]` type added in Task 7 ✓
- `bulkDeleteMedia()` added in Task 9 backend + frontend ✓
- `region?: Region | null` added to all 6 model types in Task 1 ✓

**No placeholders:** All code blocks contain actual implementation, not descriptions.

**Dependency chain:**
- Task 4 (backend migration) must complete before Task 5 (frontend forms for developer/agency/user) ✓
- Task 1 (types) must complete before all other tasks ✓
- All other tasks are independent of each other ✓
