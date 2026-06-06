<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @group Auth
 *
 * Authentication: login, logout, registration, and current user profile.
 */
class AuthController
{
    use ApiResponse;
    /**
     * Login
     *
     * Authenticate with email and password. Returns a Sanctum bearer token valid until revoked.
     *
     * @unauthenticated
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "user": {
     *       "id": 1,
     *       "name": "Jane Smith",
     *       "email": "jane@evoorion.com",
     *       "role": "manager",
     *       "is_active": true,
     *       "last_login_at": "2025-01-15T10:00:00.000000Z"
     *     },
     *     "token": "1|abc123defghijklmnopqrstuvwxyz"
     *   },
     *   "message": "Login successful",
     *   "meta": []
     * }
     * @response 422 scenario="Invalid credentials" {
     *   "message": "The provided credentials are incorrect.",
     *   "errors": {"email": ["The provided credentials are incorrect."]}
     * }
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Update last login timestamp
        $user->update(['last_login_at' => now()]);

        // Create API token
        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Login successful');
    }

    /**
     * Logout
     *
     * Revokes the current bearer token.
     *
     * @response 200 {
     *   "success": true,
     *   "data": null,
     *   "message": "Logout successful",
     *   "meta": []
     * }
     * @response 401 scenario="Unauthenticated" {"message": "Unauthenticated."}
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logout successful');
    }

    /**
     * Current user
     *
     * Returns the authenticated user's profile.
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": 1,
     *     "name": "Jane Smith",
     *     "email": "jane@evoorion.com",
     *     "role": "manager",
     *     "is_active": true,
     *     "last_login_at": "2025-01-15T10:00:00.000000Z"
     *   },
     *   "message": "User profile retrieved",
     *   "meta": []
     * }
     * @response 401 scenario="Unauthenticated" {"message": "Unauthenticated."}
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success($request->user(), 'User profile retrieved');
    }

    /**
     * Register
     *
     * Create a new user account. The new user receives the 'user' role.
     *
     * @unauthenticated
     *
     * @response 201 {
     *   "success": true,
     *   "data": {
     *     "user": {"id": 2, "name": "Mark Jones", "email": "mark@example.com", "role": "user", "is_active": true},
     *     "token": "2|xyz789abcdefghijklmno"
     *   },
     *   "message": "Registration successful",
     *   "meta": []
     * }
     * @response 422 scenario="Email taken" {
     *   "message": "The email has already been taken.",
     *   "errors": {"email": ["The email has already been taken."]}
     * }
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|max:255|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $user  = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => 'user',
            'is_active' => true,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success(['user' => $user, 'token' => $token], 'Registration successful', 201);
    }
}
