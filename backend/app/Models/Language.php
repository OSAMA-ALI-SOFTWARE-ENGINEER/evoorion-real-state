<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    use LogsActivity;

    protected $fillable = [
        'code', 'name', 'native_name', 'direction', 'is_active', 'is_default', 'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'is_default' => 'boolean',
        'sort_order' => 'integer',
    ];
}
