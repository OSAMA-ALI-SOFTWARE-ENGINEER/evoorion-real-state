<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'changes',
        'ip_address',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault(['name' => 'System']);
    }

    public static function log(
        string $action,
        string $modelType,
        ?int $modelId = null,
        ?int $userId = null,
        ?array $changes = null,
        ?string $ipAddress = null
    ): self {
        return self::create([
            'action'     => $action,
            'model_type' => $modelType,
            'model_id'   => $modelId,
            'user_id'    => $userId ?? auth()->id(),
            'changes'    => $changes,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }
}
