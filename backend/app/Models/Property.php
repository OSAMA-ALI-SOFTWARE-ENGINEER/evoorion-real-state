<?php

namespace App\Models;

use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, HasSlug, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'type',
        'price',
        'previous_price',
        'currency',
        'area_id',
        'location',
        'area_sqft',
        'bedrooms',
        'bathrooms',
        'operation_type_id',
        'status',
        'is_featured',
        'is_active',
        'roi_min',
        'roi_max',
        'developer_id',
        'primary_agent_id',
        'meta_title',
        'meta_description',
        'views_count',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'is_featured' => 'boolean',
        'price'          => 'decimal:2',
        'previous_price' => 'decimal:2',
        'area_sqft'      => 'decimal:2',
        'roi_min' => 'decimal:2',
        'roi_max' => 'decimal:2',
    ];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function developer(): BelongsTo
    {
        return $this->belongsTo(Developer::class);
    }

    public function operationType(): BelongsTo
    {
        return $this->belongsTo(OperationType::class);
    }

    public function primaryAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'primary_agent_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function amenities(): HasMany
    {
        return $this->hasMany(PropertyAmenity::class);
    }

    public function priceHistory(): HasMany
    {
        return $this->hasMany(PropertyPriceHistory::class)->orderByDesc('created_at')->orderByDesc('id');
    }

    public function agents(): BelongsToMany
    {
        return $this->belongsToMany(Agent::class, 'property_agent_assignments')
            ->withTimestamps()
            ->withPivot('assigned_at');
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\User::class, 'property_favorites')->withTimestamps();
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByOperationType($query, $operationTypeId)
    {
        return $query->where('operation_type_id', $operationTypeId);
    }

    public function scopeByArea($query, $areaId)
    {
        return $query->where('area_id', $areaId);
    }

    public function scopeByDeveloper($query, $developerId)
    {
        return $query->where('developer_id', $developerId);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('title', 'like', "%$searchTerm%")
            ->orWhere('description', 'like', "%$searchTerm%");
    }

    public function scopePriceRange($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }
}
