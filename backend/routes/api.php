<?php

use App\Http\Controllers\Api\V1\Admin\ActivityLogController;
use App\Http\Controllers\Api\V1\Admin\AgencyController;
use App\Http\Controllers\Api\V1\Admin\AgentController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\NotificationController;
use App\Http\Controllers\Api\V1\Admin\PropertyAgentController;
use App\Http\Controllers\Api\V1\Admin\PropertyAmenityController;
use App\Http\Controllers\Api\V1\Admin\ReportController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Admin\PropertyController as AdminPropertyController;
use App\Http\Controllers\Api\V1\Admin\PropertyImageController;
use App\Http\Controllers\Api\V1\Admin\AreaController as AdminAreaController;
use App\Http\Controllers\Api\V1\Admin\DeveloperController as AdminDeveloperController;
use App\Http\Controllers\Api\V1\Admin\OperationTypeController as AdminOperationTypeController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\BulkLeadController;
use App\Http\Controllers\Api\V1\SocialAuthController;
use App\Http\Controllers\Api\V1\FavoritesController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\LeadDocumentController;
use App\Http\Controllers\Api\V1\LeadTaskController;
use App\Http\Controllers\Api\V1\PasswordResetController;
use App\Http\Controllers\Api\V1\PropertyComparisonController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\AreaController;
use App\Http\Controllers\Api\V1\DeveloperController;
use App\Http\Controllers\Api\V1\OperationTypeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register'])->name('register');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });

        Route::post('forgot-password', [PasswordResetController::class, 'forgotPassword']);
        Route::post('reset-password', [PasswordResetController::class, 'resetPassword']);

        // Social OAuth — returns a redirect, not JSON (browser-based flow)
        Route::get('social/{provider}/redirect', [SocialAuthController::class, 'redirect']);
        Route::get('social/{provider}/callback', [SocialAuthController::class, 'callback']);
    });

    // Public master data endpoints (rate-limited)
    Route::middleware('throttle:120,1')->group(function () {
        Route::get('areas', [AreaController::class, 'index']);
        Route::get('areas/{area}', [AreaController::class, 'show']);
        Route::get('developers', [DeveloperController::class, 'index']);
        Route::get('developers/{developer}', [DeveloperController::class, 'show']);
        Route::get('operation-types', [OperationTypeController::class, 'index']);

        // Public property endpoints
        Route::get('properties', [PropertyController::class, 'index']);
        Route::get('properties/{property}', [PropertyController::class, 'show']);
        Route::post('properties/compare', [PropertyComparisonController::class, 'compare']);
    });

    // Blog (public, rate-limited)
    Route::middleware('throttle:120,1')->group(function () {
        Route::get('blog', [BlogController::class, 'index']);
        Route::get('blog/tags', [BlogController::class, 'tags']);
        Route::get('blog/{slug}', [BlogController::class, 'show']);
    });

    // Public lead submission (stricter rate limit)
    Route::middleware('throttle:10,1')->post('leads', [LeadController::class, 'store']);

    // Favorites (any authenticated user, no admin prefix)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('favorites', [FavoritesController::class, 'index']);
        Route::post('favorites/{property}', [FavoritesController::class, 'store']);
        Route::delete('favorites/{property}', [FavoritesController::class, 'destroy']);
    });

    // Admin endpoints
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::middleware('role:agent,manager,super_admin')->group(function () {
            // Agency & Agent read (all roles)
            Route::get('agencies', [AgencyController::class, 'index']);
            Route::get('agencies/{agency}', [AgencyController::class, 'show']);
            Route::get('agents', [AgentController::class, 'index']);
            Route::get('agents/{agent}', [AgentController::class, 'show']);

            // Dashboard stats (all admin roles)
            Route::get('dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('dashboard/agent-performance', [DashboardController::class, 'agentPerformance']);

            // Notifications (all admin roles — own notifications only)
            Route::get('notifications', [NotificationController::class, 'index']);
            Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
            Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
            Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

            // Reports (all admin roles)
            Route::get('reports/lead-funnel', [ReportController::class, 'leadFunnel']);
            Route::get('reports/leads-over-time', [ReportController::class, 'leadsOverTime']);
            Route::get('reports/property-performance', [ReportController::class, 'propertyPerformance']);
            Route::get('reports/agent-leaderboard', [ReportController::class, 'agentLeaderboard']);
            Route::get('reports/leads-by-source', [ReportController::class, 'leadsBySource']);

            // Property-Agent listing & amenities listing (all admin roles can view)
            Route::get('properties/{property}/agents', [PropertyAgentController::class, 'index']);
            Route::get('properties/{property}/amenities', [PropertyAmenityController::class, 'index']);

            // Lead endpoints
            Route::get('leads', [LeadController::class, 'index']);
            Route::get('leads/{lead}', [LeadController::class, 'show']);
            Route::put('leads/{lead}', [LeadController::class, 'update']);
            Route::delete('leads/{lead}', [LeadController::class, 'destroy']);
            Route::post('leads/{lead}/notes', [LeadController::class, 'addNote']);
            Route::get('leads/{lead}/notes', [LeadController::class, 'getNotes']);
            Route::delete('leads/{lead}/notes/{note}', [LeadController::class, 'deleteNote']);

            // Lead follow-up tasks
            Route::get('leads/{lead}/tasks', [LeadTaskController::class, 'index']);
            Route::post('leads/{lead}/tasks', [LeadTaskController::class, 'store']);
            Route::put('leads/{lead}/tasks/{task}', [LeadTaskController::class, 'update']);
            Route::delete('leads/{lead}/tasks/{task}', [LeadTaskController::class, 'destroy']);
            Route::post('leads/{lead}/tasks/{task}/complete', [LeadTaskController::class, 'complete']);

            // Lead documents
            Route::get('leads/{lead}/documents', [LeadDocumentController::class, 'index']);
            Route::post('leads/{lead}/documents', [LeadDocumentController::class, 'store']);
            Route::delete('leads/{lead}/documents/{document}', [LeadDocumentController::class, 'destroy']);
        });

        Route::middleware('role:manager,super_admin')->group(function () {
            // Bulk lead operations (all use POST to avoid route-parameter conflicts)
            Route::post('leads/bulk/status', [BulkLeadController::class, 'updateStatus']);
            Route::post('leads/bulk/assign', [BulkLeadController::class, 'assign']);
            Route::post('leads/bulk/delete', [BulkLeadController::class, 'destroy']);
            Route::post('leads/bulk/restore', [BulkLeadController::class, 'restore']);

            Route::post('leads/{id}/restore', [LeadController::class, 'restore']);
            Route::get('leads/export/csv', [LeadController::class, 'exportCSV']);

            // Activity logs
            Route::get('activity-logs', [ActivityLogController::class, 'index']);

            // Agency management (manager+)
            Route::post('agencies', [AgencyController::class, 'store']);
            Route::put('agencies/{agency}', [AgencyController::class, 'update']);
            Route::delete('agencies/{agency}', [AgencyController::class, 'destroy']);

            // Agent management (manager+)
            Route::post('agents', [AgentController::class, 'store']);
            Route::put('agents/{agent}', [AgentController::class, 'update']);
            Route::delete('agents/{agent}', [AgentController::class, 'destroy']);
            Route::post('agents/{id}/restore', [AgentController::class, 'restore']);

            // Property-Agent assignment (manager+)
            Route::post('properties/{property}/agents/{agent}', [PropertyAgentController::class, 'assign']);
            Route::delete('properties/{property}/agents/{agent}', [PropertyAgentController::class, 'unassign']);

            // Property Amenities management (manager+)
            Route::post('properties/{property}/amenities', [PropertyAmenityController::class, 'store']);
            Route::put('properties/{property}/amenities/{amenity}', [PropertyAmenityController::class, 'update']);
            Route::delete('properties/{property}/amenities/{amenity}', [PropertyAmenityController::class, 'destroy']);

            // User management (super_admin — controller enforces this)
            Route::get('users', [UserController::class, 'index']);
            Route::get('users/{user}', [UserController::class, 'show']);
            Route::put('users/{user}', [UserController::class, 'update']);
            Route::delete('users/{user}', [UserController::class, 'destroy']);
            Route::post('users/{id}/restore', [UserController::class, 'restore']);

            // Master data endpoints
            Route::resource('areas', AdminAreaController::class);
            Route::resource('developers', AdminDeveloperController::class);
            Route::resource('operation-types', AdminOperationTypeController::class);

            // Property endpoints
            Route::get('properties', [AdminPropertyController::class, 'index']);
            Route::post('properties', [AdminPropertyController::class, 'store']);
            Route::get('properties/{property}', [AdminPropertyController::class, 'show']);
            Route::put('properties/{property}', [AdminPropertyController::class, 'update']);
            Route::delete('properties/{property}', [AdminPropertyController::class, 'destroy']);
            Route::post('properties/{property}/restore', [AdminPropertyController::class, 'restore'])->withTrashed();

            // Property image endpoints
            Route::post('properties/{property}/images', [PropertyImageController::class, 'store']);
            Route::put('properties/{property}/images/{image}', [PropertyImageController::class, 'update']);
            Route::delete('properties/{property}/images/{image}', [PropertyImageController::class, 'destroy']);
        });
    });
});
