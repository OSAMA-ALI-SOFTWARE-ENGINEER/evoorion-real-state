<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agency extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
        'logo_url',
        'contact_email',
        'phone',
        'address',
        'region_id',
    ];

    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }
}
