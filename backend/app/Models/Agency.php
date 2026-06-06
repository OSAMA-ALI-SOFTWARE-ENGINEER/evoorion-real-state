<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo_url',
        'contact_email',
        'phone',
        'address',
    ];

    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class);
    }
}
