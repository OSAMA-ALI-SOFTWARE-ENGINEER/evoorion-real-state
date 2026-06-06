<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     * @param string ...$roles The roles that are allowed to access the resource
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated and has one of the required roles
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
