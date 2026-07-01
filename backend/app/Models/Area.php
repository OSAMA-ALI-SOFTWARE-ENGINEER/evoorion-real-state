<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'status', 'description', 'hero_image_url', 'gallery',
        'latitude', 'longitude',
        'long_term_roi', 'short_term_roi', 'appreciation', 'off_plan_discount',
        'price_ranges', 'meta_title', 'meta_description', 'region_id',
    ];

    protected $casts = [
        'price_ranges' => 'array',
        'gallery'      => 'array',
        'latitude'     => 'float',
        'longitude'    => 'float',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
