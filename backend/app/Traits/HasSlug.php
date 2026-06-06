<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::creating(function ($model) {
            if (empty($model->slug) && !empty($model->title)) {
                $slug = Str::slug($model->title);
                $counter = 1;
                $originalSlug = $slug;

                while (static::where('slug', $slug)->exists()) {
                    $slug = $originalSlug . '-' . $counter++;
                }

                $model->slug = $slug;
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
