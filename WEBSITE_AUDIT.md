# EVOORION Website — Implementation Audit

**Date:** 2026-06-06  
**Audited:** `apps/website/` against backend routes in `backend/routes/api.php` and design doc in `docs/superpowers/specs/`

---

## 1. Pages Built

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Complete | 7 sections: Hero, TrustStrip, WhatWeDo, FeaturedProperties, WhyDubai, OurProcess, CTABanner |
| `/properties` | ✅ Complete | Type tabs + keyword search + pagination; client-side fetch |
| `/properties/[slug]` | ✅ Complete | SSR with Next.js; gallery, stats, amenities, lead form, WhatsApp CTA |
| `/investments` | ✅ Complete | Static — 3 investment type cards + WhyDubai + lead form |
| `/about` | ✅ Complete | Static — story, mission quote, differentiators, CTA |
| `/contact` | ✅ Complete | Two-column: contact info + lead form; map placeholder |
| `/blog` | ❌ Missing | Not built. Blog backend was not implemented in phases 3–8 either. |
| `/blog/[slug]` | ❌ Missing | Not built. |

---

## 2. Backend API — What the Website Uses

| Endpoint | Used by Website | Notes |
|---|---|---|
| `GET /api/v1/properties` | ✅ | Homepage FeaturedProperties + /properties page |
| `GET /api/v1/properties/{slug}` | ✅ | /properties/[slug] SSR |
| `POST /api/v1/leads` | ✅ | LeadForm component on all relevant pages |
| `GET /api/v1/areas` | ❌ Not used | API type exists in `api.ts` but no UI dropdown |
| `GET /api/v1/developers` | ❌ Not used | No developer filter on properties page |
| `GET /api/v1/operation-types` | ❌ Not used | No Buy/Rent/Stay filter on properties page |
| `POST /api/v1/properties/compare` | ❌ Not used | Backend built, no comparison UI |
| `GET /api/v1/favorites` | ❌ Not used | Backend built, no auth/wishlist UI |
| `POST /api/v1/favorites/{property}` | ❌ Not used | Same |
| `DELETE /api/v1/favorites/{property}` | ❌ Not used | Same |
| `POST /api/v1/auth/login` | ❌ Not used | No auth UI on website |
| `POST /api/v1/auth/register` | ❌ Not used | Same |

---

## 3. Backend APIs That Were Never Implemented

These appear in the original design spec (`docs/superpowers/specs/2026-06-03-evoorion-backend-design.md`) but were not built in backend phases 3–8 and are absent from `routes/api.php`:

| Feature | Design Doc Endpoint | Status |
|---|---|---|
| Blog public list | `GET /api/v1/blog` | ❌ Not built |
| Blog single post | `GET /api/v1/blog/{slug}` | ❌ Not built |
| Blog tags | `GET /api/v1/blog/tags` | ❌ Not built |
| Public settings | `GET /api/v1/settings/public` | ❌ Not built |
| CMS pages | `GET /api/v1/pages/{slug}` | ❌ Not built |
| User preferences | `GET/PUT /api/v1/user/preferences` | ❌ Not built |
| Media library | `GET /api/v1/admin/media` | ❌ Not built |
| Admin blog CRUD | `GET/POST/PUT/DELETE /api/v1/admin/blog` | ❌ Not built |
| Admin CMS | `GET/PUT /api/v1/admin/cms/{slug}` | ❌ Not built |
| Admin settings | `GET/PUT /api/v1/admin/settings` | ❌ Not built |

---

## 4. Known Bugs & Type Mismatches

### 4.1 `PropertyStatus` enum mismatch — **Bug**

**File:** [apps/website/src/types/index.ts](apps/website/src/types/index.ts#L29)

Frontend type:
```typescript
export type PropertyStatus = 'available' | 'sold' | 'off_plan'
```

Backend enum (from migration):
```
ENUM('available', 'sold', 'rented')
```

`off_plan` is not a backend status — it is an **operation type** (`OperationType` table). The backend will never send `status: 'off_plan'`. The `StatusBadge` in [PropertyDetailClient.tsx](apps/website/src/app/properties/[slug]/PropertyDetailClient.tsx#L24-L37) handles `off_plan` but it will never match a real property. The fallback data in [FeaturedProperties.tsx](apps/website/src/components/home/FeaturedProperties.tsx#L42) uses `status: 'off_plan'` which is invalid per the backend schema.

**Fix:** Change `PropertyStatus` to `'available' | 'sold' | 'rented'`. Expose off-plan as an `operation_type` filter instead.

---

### 4.2 `PropertyAmenity.name` field mismatch — **Potential Bug**

**File:** [apps/website/src/types/index.ts](apps/website/src/types/index.ts#L9)

Frontend expects:
```typescript
interface PropertyAmenity { id: number; name: string }
```

Backend `PropertyAmenity` model stores the `amenity` column (string), not `name`. If the API serializes as `{ id, amenity }`, then `a.name` in [PropertyDetailClient.tsx:247](apps/website/src/app/properties/[slug]/PropertyDetailClient.tsx#L247) will be `undefined`.

**Verify:** Check what `/api/v1/properties/{slug}` returns in the `amenities` array — field is `amenity` or `name`.

---

### 4.3 Placeholder phone/WhatsApp numbers

- Navbar CTA links to `/contact` (fine), but the WhatsApp CTA on the property detail page hard-codes `wa.me/971000000000` ([PropertyDetailClient.tsx:52](apps/website/src/app/properties/[slug]/PropertyDetailClient.tsx#L52)).
- Footer and Contact page both display `+971 00 000 0000`.

**Fix:** Replace once real number is confirmed. Ideally drive from a settings API or `.env`.

---

### 4.4 Map placeholder on Contact page

[Contact page](apps/website/src/app/contact/page.tsx#L127-L134) shows a static grey box with "Map integration coming soon."

---

## 5. Missing Website Filters (Properties Page)

The backend `GET /api/v1/properties` supports these query params (all wired in `api.ts`):

| Param | Backend support | Website UI |
|---|---|---|
| `type` | ✅ | ✅ Type tabs |
| `search` | ✅ | ✅ Keyword input |
| `featured` | ✅ | ✅ Used on homepage |
| `page` / `per_page` | ✅ | ✅ Pagination |
| `area_id` | ✅ | ❌ No dropdown |
| `min_price` / `max_price` | ✅ | ❌ No price range UI |
| `operation_type_id` | ✅ via backend | ❌ No filter |

Adding area + operation type filters would require fetching `/api/v1/areas` and `/api/v1/operation-types` on page load.

---

## 6. Summary — What's Left to Build

### Must-fix bugs
- [ ] Fix `PropertyStatus` type — remove `off_plan`, add `rented`; update `StatusBadge` and fallback data
- [ ] Verify/fix `PropertyAmenity` field name (`amenity` vs `name`)

### Website features not yet built
- [ ] Area + operation type + price range filters on `/properties`
- [ ] Property comparison UI (backend at `POST /api/v1/properties/compare`)
- [ ] Favorites/wishlist (heart icon on cards + `/favorites` page) — requires auth
- [ ] User auth UI (login modal or `/login` page) — prerequisite for favorites
- [ ] Real WhatsApp/phone numbers (replace placeholders)
- [ ] Google Maps embed on contact page

### Blog (requires backend first)
- [ ] Backend: `BlogPost`, `BlogTag` models, migrations, controllers, public routes
- [ ] Website: `/blog` list page + `/blog/[slug]` detail page

### Nice-to-have
- [ ] `GET /api/v1/settings/public` — drive WhatsApp/email/phone dynamically
- [ ] SEO: `sitemap.xml`, `robots.txt`
- [ ] Open Graph images per property (using property primary image)

---

## 7. What's Solid

- All 6 planned pages are built and visually complete
- Lead form submits correctly to `POST /api/v1/leads` with proper payload shape
- Property listing + detail pages are fully API-connected with graceful fallbacks
- SSR on property detail with Next.js metadata for SEO
- Design system (Tailwind v4 tokens, Playfair Display, Inter) consistent across all pages
- Real brand logos in navbar + footer
- Responsive layout, mobile menu, floating WhatsApp button
- Framer Motion animations throughout with `ScrollReveal`
