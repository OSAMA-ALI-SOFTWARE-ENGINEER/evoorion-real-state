<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialExchangeCode extends Model
{
    protected $fillable = ['code', 'token', 'expires_at'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }

    public static function purgeExpired(): void
    {
        static::where('expires_at', '<', now())->delete();
    }

    public static function issue(string $token): string
    {
        static::purgeExpired();

        $code = bin2hex(random_bytes(32)); // 64 hex chars

        static::create([
            'code'       => $code,
            'token'      => $token,
            'expires_at' => now()->addSeconds(30),
        ]);

        return $code;
    }
}
