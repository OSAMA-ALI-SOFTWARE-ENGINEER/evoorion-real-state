<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    use LogsActivity;

    protected $fillable = ['page_slug', 'section_key', 'content'];

    protected $casts = ['content' => 'json'];
}
