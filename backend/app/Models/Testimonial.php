<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use LogsActivity;

    protected $fillable = [
        'author_name', 'author_title', 'quote', 'rating',
        'avatar_url', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'rating'    => 'integer',
    ];
}
