<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @group Auth
 *
 * Password reset flow: request a reset email, then submit a new password.
 */
class PasswordResetController extends Controller
{
    /**
     * Forgot password
     *
     * Sends a password reset email. Response is always 200 regardless of whether
     * the email is registered — prevents user enumeration.
     *
     * @unauthenticated
     *
     * @response 200 {
     *   "success": true,
     *   "message": "If that email exists, a reset link has been sent"
     * }
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration
        if (! $user) {
            return response()->json(['success' => true, 'message' => 'If that email exists, a reset link has been sent']);
        }

        // Remove any existing token for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        $plainToken = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email'      => $request->email,
            'token'      => Hash::make($plainToken),
            'created_at' => Carbon::now(),
        ]);

        $user->notify(new ResetPasswordNotification($plainToken));

        return response()->json([
            'success' => true,
            'message' => 'If that email exists, a reset link has been sent',
        ]);
    }

    /**
     * Reset password
     *
     * Resets the password using the token received by email. Revokes all existing Sanctum tokens.
     *
     * @unauthenticated
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Password reset successfully"
     * }
     * @response 422 scenario="Invalid or expired token" {
     *   "success": false,
     *   "message": "Invalid or expired token"
     * }
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired token'], 422);
        }

        // Tokens expire after 60 minutes
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json(['success' => false, 'message' => 'Token has expired'], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => Hash::make($request->password)]);

        // Revoke all existing tokens on password change
        $user->tokens()->delete();
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['success' => true, 'message' => 'Password reset successfully']);
    }
}
