# EVOORION Backend API Design Document

**Date:** 2026-06-03  
**Project:** EVOORION — Luxury Dubai Real Estate Platform  
**Stack:** Laravel 11, MySQL, Eloquent ORM, Sanctum, Redis, Cloudinary  

---

## 1. PROJECT OVERVIEW

EVOORION is a curated luxury real estate marketplace for Dubai featuring properties (villas, apartments, penthouses, townhouses, commercial), lead management, blog content, and admin dashboards. The backend provides a comprehensive REST API with role-based access control, Cloudinary image management, email notifications, analytics, and comprehensive test coverage.

---

## 2. DATABASE SCHEMA

### Core Tables

#### Users (with roles)
```
id, name, email, password, role (enum: super_admin, manager, agent), 
last_login_at, is_active, deleted_at (soft delete), timestamps
```
- `super_admin`: Full system access, user/settings management
- `manager`: Property, blog, agency, area, developer management + analytics
- `agent`: Lead management, property assignment, own wishlists

#### Properties
```
id, title, slug (unique), description, type (enum: villa, apartment, penthouse, townhouse, commercial),
price, currency (default: AED), area_id (FK), location (string for internal notes),
area_sqft, bedrooms, bathrooms, operation_type_id (FK), status (enum: available, sold, rented),
is_featured, roi_min, roi_max, developer_id (FK), primary_agent_id (FK nullable),
meta_title, meta_description, views_count, deleted_at, timestamps
```

#### Property Images
```
id, property_id (FK), url, public_id (Cloudinary), is_primary, 
order (for sorting), timestamps
```

#### Property Amenities
```
id, property_id (FK), amenity (string: "pool", "gym", "parking", etc.), timestamps
```

#### Property Agent Assignments
```
id, property_id (FK), agent_id (FK), assigned_at, timestamps
```

#### Areas
```
id, name, slug (unique), description, timestamps
```
Examples: Palm Jumeirah, Downtown Dubai, Dubai Marina, Emirates Hills, Al Barari

#### Developers
```
id, name, logo_url (Cloudinary), description, timestamps
```
Examples: Emaar, Damac, Azizi, Meraas

#### Property Operation Types
```
id, name (enum: Buy, Rent, Stay, Off-plan)
```

#### Leads
```
id, name, email, phone, whatsapp, property_id (FK nullable), budget_min, budget_max,
message, source (enum: website, instagram, facebook, whatsapp, referral, other),
status (enum: new, contacted, qualified, closed, lost), assigned_to (FK users nullable),
deleted_at, timestamps
```

#### Lead Notes
```
id, lead_id (FK), user_id (FK), note (text), timestamps
```

#### Blog Posts
```
id, title, slug (unique), excerpt, content (longText), featured_image (Cloudinary URL),
author_id (FK users), status (enum: draft, published, scheduled), published_at,
meta_title, meta_description, views_count, deleted_at, timestamps
```

#### Blog Tags
```
id, name, slug (unique), timestamps
```

#### Blog Post Tags (Pivot)
```
blog_post_id (FK), blog_tag_id (FK), primary key(both)
```

#### Media Files
```
id, name, url (Cloudinary), public_id (Cloudinary), type (enum: image, video),
folder (string: properties, blog, media_library, etc.), size (bytes), timestamps
```

#### Page Contents
```
id, page_slug (unique), section_key (string), content (JSON), timestamps
```
Examples: page_slug="about", section_key="hero_title" → flexible CMS structure

#### Settings
```
id, key (unique: "whatsapp", "phone", "address", "email", "social_facebook", etc.),
value (text/JSON), timestamps
```

#### User Wishlists
```
id, user_id (FK), property_id (FK), created_at
```

#### User Preferences
```
id, user_id (FK), currency (AED/USD/EUR/etc.), area_unit (SQ.FT/SQ.M), timestamps
```

#### Activity Logs
```
id, user_id (FK), action (string: "created", "updated", "deleted", etc.),
model_type (string: "Property", "Lead", etc.), model_id, ip_address,
changes (JSON: before/after values), timestamps
```

#### Agencies
```
id, name, logo_url (Cloudinary nullable), contact_email, phone, address, timestamps
```

#### Agents
```
id, user_id (FK), agency_id (FK), phone, whatsapp, deleted_at, timestamps
```

---

## 3. ELOQUENT MODELS & RELATIONSHIPS

### User
```php
hasMany leads (assigned_to)
hasMany blogPosts (author)
hasMany activityLogs
hasOne userPreference
hasMany wishlists
hasManyThrough favoriteProperties (via wishlists)
hasOne agent (if role === agent)
```

### Property
```php
belongsTo developer
belongsTo area
belongsTo operationType
belongsTo primaryAgent (Agent, nullable)
hasMany images
hasMany amenities
belongsToMany agents (via property_agent_assignments)
hasMany wishlists
hasManyThrough interestedUsers (via wishlists)

scopes:
  - scopeFeatured()
  - scopeAvailable()
  - scopeByType($type)
  - scopeByOperationType($type)
  - scopeByArea($areaId)
  - scopeByDeveloper($developerId)
  - scopeSearch($query) — title, description
```

### Wishlist
```php
belongsTo user
belongsTo property
```

### Lead
```php
belongsTo property (nullable)
belongsTo assignedUser (User, assigned_to, nullable)
hasMany notes

scopes:
  - scopeByStatus($status)
  - scopeByDateRange($from, $to)
  - scopeBySource($source)
  - scopeSearch($query) — name, email, phone
```

### BlogPost
```php
belongsTo author (User)
belongsToMany tags (blog_tags)
hasMany comments (if future feature)

scopes:
  - scopePublished()
  - scopeScheduled()
  - scopeByAuthor($authorId)
```

### Developer, Area, Agency, Agent, OperationType
- Standard relationships to Property/User

### ActivityLog
```php
belongsTo user
```

---

## 4. API ENDPOINTS & CONTROLLERS

### Public Endpoints (No Auth)

**Authentication**
- `POST /api/v1/auth/login` — returns Sanctum token
- `POST /api/v1/auth/register` — optional for frontend self-signup

**Properties**
- `GET /api/v1/properties` — filters: area_id, operation_type_id, type, featured, min_price, max_price, search, page
- `GET /api/v1/properties/{id}` — increments views_count
- `GET /api/v1/areas` — list all areas
- `GET /api/v1/areas/{slug}/properties` — paginated properties in area
- `GET /api/v1/developers` — list all developers
- `GET /api/v1/developers/{slug}/properties` — paginated developer's properties

**Blog**
- `GET /api/v1/blog` — published only, paginate
- `GET /api/v1/blog/{slug}`
- `GET /api/v1/blog/tags` — available tags

**CMS & Settings**
- `GET /api/v1/settings/public` — whatsapp, phone, email, address, social links, available currencies, area units
- `GET /api/v1/pages/{slug}` — static page content

**Leads**
- `POST /api/v1/leads` — submit inquiry (public), triggers email to admin

---

### Protected Endpoints (Auth Required)

**Auth**
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me` — current user profile

**Wishlists (All Auth Users)**
- `GET /api/v1/wishlists`
- `POST /api/v1/wishlists` — add property
- `DELETE /api/v1/wishlists/{id}` — remove from favorites

**User Preferences**
- `GET /api/v1/user/preferences`
- `PUT /api/v1/user/preferences` — currency, area_unit

---

### Admin Endpoints (Role-Based: agent+, manager+, super_admin)

**Properties (manager+)**
- `GET /api/v1/admin/properties` — includes soft-deleted admin view
- `POST /api/v1/admin/properties` — create
- `GET /api/v1/admin/properties/{id}`
- `PUT /api/v1/admin/properties/{id}`
- `DELETE /api/v1/admin/properties/{id}` — soft delete
- `POST /api/v1/admin/properties/{id}/restore` — restore soft-deleted

**Property Images (manager+)**
- `POST /api/v1/admin/properties/{id}/images` — Cloudinary upload
- `PUT /api/v1/admin/properties/{id}/images/{imageId}` — reorder
- `DELETE /api/v1/admin/properties/{id}/images/{imageId}`

**Property Agents (manager+)**
- `POST /api/v1/admin/properties/{id}/agents` — assign agent
- `DELETE /api/v1/admin/properties/{id}/agents/{agentId}` — remove assignment

**Leads (agent+)**
- `GET /api/v1/admin/leads` — filters: status, date_from, date_to, search
- `GET /api/v1/admin/leads/{id}`
- `PUT /api/v1/admin/leads/{id}` — update status, notes
- `DELETE /api/v1/admin/leads/{id}` — soft delete
- `POST /api/v1/admin/leads/{id}/restore`
- `POST /api/v1/admin/leads/{id}/notes` — add note
- `GET /api/v1/admin/leads/{id}/notes`
- `DELETE /api/v1/admin/leads/{id}/notes/{noteId}`
- `GET /api/v1/admin/leads/export/csv` — query: date_from, date_to, status

**Blog (manager+)**
- `GET /api/v1/admin/blog`
- `POST /api/v1/admin/blog` — create, auto-generates slug
- `GET /api/v1/admin/blog/{id}`
- `PUT /api/v1/admin/blog/{id}`
- `DELETE /api/v1/admin/blog/{id}` — soft delete
- `POST /api/v1/admin/blog/{id}/restore`
- `POST /api/v1/admin/blog/tags` — manage tags

**Media (all auth roles)**
- `GET /api/v1/admin/media` — filter: folder, type
- `POST /api/v1/admin/media/upload` — Cloudinary
- `DELETE /api/v1/admin/media/{id}`

**Master Data (manager+)**
- `GET/POST /api/v1/admin/agencies`
- `PUT/DELETE /api/v1/admin/agencies/{id}`
- `GET/POST /api/v1/admin/agents`
- `PUT/DELETE /api/v1/admin/agents/{id}`
- `GET/POST /api/v1/admin/areas`
- `PUT/DELETE /api/v1/admin/areas/{id}`
- `GET/POST /api/v1/admin/developers`
- `PUT/DELETE /api/v1/admin/developers/{id}`

**CMS Pages (super_admin)**
- `GET /api/v1/admin/cms/{page_slug}`
- `PUT /api/v1/admin/cms/{page_slug}`

**Users (super_admin)**
- `GET/POST /api/v1/admin/users`
- `GET/PUT/DELETE /api/v1/admin/users/{id}`

**Settings (super_admin)**
- `GET/PUT /api/v1/admin/settings`

**Analytics (manager+)**
- `GET /api/v1/admin/analytics/overview` — total leads, new this month, total properties, available count, top 5 viewed, leads by status, by source
- `GET /api/v1/admin/analytics/properties` — views over time
- `GET /api/v1/admin/analytics/leads` — conversion funnel, source breakdown

---

## 5. RESPONSE FORMAT

All endpoints return consistent envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": { "pagination": { "current_page": 1, "total": 100, "per_page": 15 } }
}
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "meta": { "errors": { "email": ["Email is required"], "title": ["Title must be unique"] } }
}
```

**Validation Errors:** HTTP 422, includes field-level errors in meta.errors

**Auth Errors:** HTTP 401 (invalid token), HTTP 403 (insufficient role)

**Not Found:** HTTP 404

**Rate Limited:** HTTP 429 (public endpoints: 60/min, auth: 300/min)

---

## 6. AUTHENTICATION & AUTHORIZATION

**Sanctum Token Auth:**
- Login returns `token` in response
- Frontend includes `Authorization: Bearer {token}` header
- Tokens tied to user roles

**Roles:**
- `super_admin` — all access
- `manager` — properties, blog, analytics, agencies, agents, areas, developers
- `agent` — leads, property assignments, own wishlists
- `user` — public read, wishlists, lead submission

**RoleMiddleware:** Validates `user->role` against route's required roles

**CORS:** Configured for localhost:3000, localhost:3001, + production URLs via .env

---

## 7. SERVICES & BUSINESS LOGIC

**CloudinaryService** (`app/Services/CloudinaryService.php`)
- `uploadImage(file, folder)` → `{url, public_id}`
- `uploadVideo(file, folder)` → `{url, public_id}`
- `deleteMedia(public_id)`

**LeadService** (`app/Services/LeadService.php`)
- `createLead(data)` → queues notification email
- `assignLead(leadId, agentId)` → queues assignment email to agent
- `changeStatus(leadId, status)` → logs activity
- `exportCSV(filters)` → streaming response

**NotificationService** (`app/Services/NotificationService.php`)
- Queued jobs: lead assigned, property created, blog published
- Sends via mail queue

**AnalyticsService** (`app/Services/AnalyticsService.php`)
- `getOverviewStats()` → cached (1 hour)
- `getPropertyStats(dateRange)` → views, top properties
- `getLeadStats(dateRange)` → funnel, source breakdown

**PropertyService** (`app/Services/PropertyService.php`)
- `createProperty(data)` → auto-generates slug
- `incrementViews(id)` → Redis counter
- Caches by area/developer (1 hour TTL)

**CacheHelper:**
- Properties by area/developer: 1 hour
- Popular searches: 24 hours
- Invalidates on update/delete

---

## 8. VALIDATION & FORM REQUESTS

Each action has dedicated Form Request:
- `StorePropertyRequest`, `UpdatePropertyRequest`
- `StoreLeadRequest`
- `StoreBlogPostRequest`
- `StoreAgencyRequest`, `StoreAgentRequest`
- Includes rules, authorize() for role checks, messages

---

## 9. ACTIVITY LOGGING

Middleware logs all admin mutations:
- Action: created, updated, deleted, restored
- Model type & ID
- User, IP, timestamp
- Changes (JSON: before/after) for updates

---

## 10. TESTING STRATEGY

**Feature Tests** (PHPUnit, SQLite :memory:)
- Auth: login, logout, invalid credentials
- Properties: CRUD, filtering, soft deletes, image upload
- Leads: CRUD, assignment, CSV export, notes
- Blog: create, publish, schedule, soft deletes
- Wishlists: add, remove, list
- Analytics: overview, lead funnel
- Authorization: role-based access
- Rate limiting: public endpoint limits

**Unit Tests**
- Services: CloudinaryService (mocked), LeadService, AnalyticsService
- Models: slugs, scopes, relationships
- Slug generation uniqueness

**Coverage:** 80%+ for critical paths

**Database:** SQLite in-memory for speed, refresh per test

---

## 11. IMPLEMENTATION SEQUENCE

**Phase 1 (Days 1-2): Foundation**
- Migrations + models with relationships
- Seeders: admin user, properties, settings
- Sanctum auth (login/logout)
- Role middleware
- Basic response envelope

**Phase 2 (Days 2-3): Properties**
- Property CRUD + soft deletes
- Cloudinary image upload
- Areas, Developers CRUD
- Property filtering, search
- Views counter (Redis)

**Phase 3 (Days 3-4): Leads & Agents**
- Leads CRUD + soft deletes + notes
- Agent assignments + email notifications
- Agencies, Agents CRUD
- Lead CSV export
- Activity logging

**Phase 4 (Days 4-5): Content**
- Blog CRUD, tags, publishing, soft deletes
- Wishlists/Favorites
- User preferences
- CMS pages

**Phase 5 (Day 5): Admin & Analytics**
- Analytics endpoints (cached)
- User management (super_admin)
- Settings management
- Master data CRUD refinement

**Phase 6 (Days 5-6): Polish & Docs**
- OpenAPI/Swagger docs (l5-swagger)
- Comprehensive test suite (80%+ coverage)
- Rate limiting (Laravel throttle middleware)
- Error handling refinement
- CORS finalization

---

## 12. ENVIRONMENT VARIABLES

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=evoorion
DB_USERNAME=root
DB_PASSWORD=

# Cloudinary
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Frontend URLs (CORS)
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
PRODUCTION_URL=https://evoorion.ae
PRODUCTION_ADMIN_URL=https://admin.evoorion.ae

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail (Notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@evoorion.com
MAIL_FROM_NAME="EVOORION"

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001
APP_URL=http://localhost:8000

# API Rate Limiting
API_RATE_LIMIT_PUBLIC=60
API_RATE_LIMIT_AUTH=300
```

---

## 13. KEY TECHNICAL DECISIONS

✅ **Modular Services** — business logic separate from controllers for testability  
✅ **Form Requests** — centralized validation per endpoint  
✅ **Repository Pattern** — optional; using Eloquent scopes for queries  
✅ **Queue Jobs** — async emails/notifications (Redis queue)  
✅ **Soft Deletes** — all critical entities (Property, Lead, BlogPost, User, Agent)  
✅ **Redis Caching** — property views, frequently accessed data (1hr-24hr TTL)  
✅ **API Versioning** — `/api/v1` for future compatibility  
✅ **Activity Logging** — middleware tracks all admin mutations  
✅ **Consistent Response Envelope** — same structure for success/error  
✅ **OpenAPI/Swagger** — auto-generated API documentation  

---

## 14. ASSUMPTIONS & CONSTRAINTS

- MySQL available locally/hosted
- Redis available for caching & queues
- Cloudinary account configured
- Frontend at localhost:3000 (React)
- Admin panel at localhost:3001 (React)
- SMTP/mail service configured (Mailtrap for dev)
- Sanctum tokens used (not OAuth)
- No multi-currency conversion (prices stored in AED, but UI can display converted values)
- Soft deletes preferred over hard deletes for audit trail

---

## 15. FUTURE ENHANCEMENTS

- Virtual tours / 3D property views
- Advanced filtering (furnished status, amenities checklist)
- User reviews/ratings on properties
- Mortgage calculator widget
- Notification preferences per user
- SMS notifications (Twilio)
- Property comparison tool
- Saved searches for users
- Commission management for agents

---

**Approved by:** User  
**Ready for Implementation:** Yes  
