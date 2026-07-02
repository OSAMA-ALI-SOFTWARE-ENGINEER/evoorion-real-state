# Admin Panel Region Enhancement — Design Spec
**Date:** 2026-07-02  
**Scope:** 8 independent feature areas across the EVOORION admin panel

---

## 1. Region Badges (Visual Labels)

**Goal:** Every list and card view that displays content shows a small region badge so admins can instantly see which region a record belongs to.

**Affected pages:** Properties, Areas, Blog posts, Leads, Developers, Agencies, Users.

**Implementation:**
- A shared `<RegionBadge region={record.region} />` component: renders `{flag} {name}` in a small pill (e.g. `🇮🇹 Italy`). If `region` is null, renders nothing (global content).
- Badge style: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300`.
- Applied in both **table row** (after title/name column) and **card view** (overlay chip on image or below name).
- The `region` object (`{ code, name, flag }`) must be eager-loaded by the backend on each list endpoint. No new API calls — just include it in existing responses.

**Backend:** Add `->with('region:id,code,name,flag')` to list queries for developers, agencies, users (once region_id is added). Properties/areas/blogs already load region.

---

## 2. Dashboard Region Breakdown

**Goal:** The dashboard gains a "By Region" panel showing lead count and property count per region, alongside existing KPIs.

**Implementation:**
- New panel below the existing KPI row: `"Content by Region"` — a horizontal strip of region cards.
- Each card: flag + region name, `N properties` count, `N leads` count.
- Data source: reuse existing `getLeadsBySource()` concept — add a new backend endpoint `GET /admin/reports/by-region` returning `[{ region_id, region: {code,name,flag}, properties_count, leads_count }]`.
- Loading state: skeleton cards matching the strip layout.
- "No regions" state: hidden entirely if regions table is empty.

---

## 3. Reports — Region Filter

**Goal:** All 5 report tabs (Lead Funnel, Leads over Time, Property Performance, Agent Leaderboard, Leads by Source) gain a region dropdown filter.

**Implementation:**
- A `RegionFilter` dropdown sits in the reports page header, shared across all tabs.
- Default: "All Regions". Options: fetched from `getRegions()` on mount.
- Selected region code is passed as `?region=italy` query param to every existing report API call.
- Backend: each `/admin/reports/*` endpoint accepts an optional `region` param and applies a join/whereHas filter.
- The filter persists when switching between report tabs (component-level state).

---

## 4. Leads — Region Display & Filter

**Goal:** The leads list shows which region a lead is associated with, and allows filtering by region.

**Data model:** Leads don't have a direct `region_id`. A lead is linked to a property via `property_id`. Region is derived: `lead → property → region`. If the lead has no property, region is null.

**Implementation:**
- Backend: eager-load `property.region:id,code,name,flag` on the leads list endpoint.
- Frontend: add a "Region" column (RegionBadge) in the leads table after the "Source" column.
- Add a "Region" filter dropdown to the leads filter bar (alongside Status and Source filters).
- Filter param: `?region=uk` — backend filters `whereHas('property.region', ...)`.
- Leads with no linked property show no region badge (acceptable — walk-in / direct leads).

---

## 5. Region FK on Developers, Agencies, Users

**Goal:** Developers, agencies, and users can each be assigned to a region so their content is scoped.

**Backend changes:**
- Migration: add nullable `region_id` FK (with cascade null on delete) to `developers`, `agencies`, `users` tables.
- Add `region(): BelongsTo` to `Developer`, `Agency`, `User` models.
- Add `region_id` to `$fillable` on each model.
- List endpoints: add `->with('region:id,code,name,flag')`.
- Store/update endpoints: accept `region_id` (nullable integer).

**Frontend changes:**
- Admin forms for Developers, Agencies, and Users each get a Region selector (same pattern as PropertyForm — `<CustomSelect>` with regions loaded from API).
- List pages show RegionBadge on each row/card.

---

## 6. Media Page — Bulk Select & Delete

**Goal:** Admins can select multiple media files and delete them in one action.

**Implementation:**
- Add a "Select" toggle button in the media toolbar (per folder tab). When active, each file card shows a checkbox overlay.
- Selected state tracked as `Set<string>` of file URLs.
- "Select all" checkbox in toolbar when select mode is active.
- Bulk delete button appears when ≥1 items selected: `"Delete (N)"` — triggers `ConfirmModal` then calls `deleteMedia(urls[])` in sequence (or a new batch endpoint if available).
- Deselect all / exit select mode via "Cancel" button.
- No changes to the existing single-file delete flow.

**Backend:** If no batch endpoint exists, call existing `DELETE /admin/media` sequentially. Add a `POST /admin/media/bulk-delete` endpoint accepting `{ urls: string[] }` for efficiency.

---

## 7. CMS — New Pages

**Goal:** The CMS editor covers all website pages, including the recently added marketing pages.

**Current pages:** home, about, contact, investments (4 pages).

**New pages to add:** off-plan, sell, agents, services, property-management (5 pages).

**Implementation:**
- The CMS page already does dynamic page discovery from the API (`GET /admin/cms/pages`).
- Backend: ensure these 5 slugs are registered in the CMS pages list (seeder or config).
- Frontend: no code changes needed if the backend returns them — the CMS page renders whatever the API returns. Verify this assumption; if slugs are hardcoded on the frontend, add them to the page list array.
- Each new page gets the same section editor (add/edit/delete sections with key + content).

---

## 8. Translations — Region Sections Tab

**Goal:** A new "Regions" tab in the translations editor lets admins manage region-specific copy (hero headlines, descriptions, CTAs) for each region's dedicated content area.

**Implementation:**
- New tab "Regions" added alongside English / Arabic / German tabs.
- Within the tab: an accordion per region (same pattern as Regional Offices settings).
- Each region accordion contains editable fields for region-specific copy:
  - `region_{code}_hero_title` — Hero heading for the region's landing page
  - `region_{code}_hero_subtitle` — Subheading
  - `region_{code}_investment_description` — Investment pitch text
  - `region_{code}_cta_label` — CTA button text
- Fields are saved as settings keys (same mechanism as existing translations — `POST /admin/settings`).
- Regions loaded dynamically from `getRegions()`. If no regions: empty state with link to Regions page.
- The website reads these keys via the settings API and uses them on region-specific pages/sections.

---

## Implementation Order (Recommended)

| Phase | Items | Rationale |
|---|---|---|
| 1 | Region badges (all views) + shared RegionBadge component | Zero backend work, immediate visual value |
| 2 | Backend: region_id migration for developers/agencies/users | Unblocks admin forms + list badges for those models |
| 3 | Dashboard region panel + Reports region filter | New backend endpoint needed |
| 4 | Leads region display + filter | Requires backend eager-load + filter param |
| 5 | Media bulk delete | Self-contained, no region dependency |
| 6 | CMS new pages | Backend slug registration |
| 7 | Translations region tab | Builds on settings pattern |

---

## Shared Component

```tsx
// apps/admin/src/components/ui/RegionBadge.tsx
interface RegionBadgeProps {
  region?: { code: string; name: string; flag?: string | null } | null
}
export function RegionBadge({ region }: RegionBadgeProps) {
  if (!region) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-400">
      {region.flag && <span>{region.flag}</span>}
      {region.name}
    </span>
  )
}
```

---

## Out of Scope
- Website-facing region pages (handled separately)
- Region-specific pricing or currency rules
- Automatic region detection for new content
