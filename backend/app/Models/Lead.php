<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'whatsapp',
        'property_id',
        'budget_min',
        'budget_max',
        'message',
        'source',
        'status',
        'assigned_to',
    ];

    protected $casts = [
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class)->withDefault();
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to')->withDefault();
    }

    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(LeadTask::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(LeadDocument::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDateRange($query, $from, $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }

    public function scopeBySource($query, $source)
    {
        return $query->where('source', $source);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('name', 'like', "%$searchTerm%")
            ->orWhere('email', 'like', "%$searchTerm%")
            ->orWhere('phone', 'like', "%$searchTerm%");
    }

    public function scopeAssignedToAgent($query, $agentId)
    {
        return $query->where('assigned_to', $agentId);
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }
}
