<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyAmenity extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'amenity',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
