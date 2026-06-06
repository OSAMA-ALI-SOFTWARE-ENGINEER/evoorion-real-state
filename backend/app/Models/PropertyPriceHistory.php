<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyPriceHistory extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'property_id',
        'price',
        'currency',
        'changed_by',
    ];

    protected $casts = [
        'price'      => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
