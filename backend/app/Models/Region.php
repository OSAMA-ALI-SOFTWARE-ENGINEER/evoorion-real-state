<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    use LogsActivity;

    protected $fillable = ['code', 'name', 'flag', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function areas(): HasMany
    {
        return $this->hasMany(Area::class);
    }

    public function blogPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class);
    }
}
