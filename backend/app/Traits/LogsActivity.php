<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            ActivityLog::log(
                action: 'created',
                modelType: class_basename($model),
                modelId: $model->getKey(),
                changes: ['after' => $model->attributesForActivityLog($model->getAttributes())],
            );
        });

        static::updated(function (Model $model) {
            $after = $model->attributesForActivityLog($model->getChanges());

            if (empty($after)) {
                return;
            }

            ActivityLog::log(
                action: 'updated',
                modelType: class_basename($model),
                modelId: $model->getKey(),
                changes: [
                    'before' => array_intersect_key($model->getRawOriginal(), $after),
                    'after'  => $after,
                ],
            );
        });

        static::deleted(function (Model $model) {
            ActivityLog::log(
                action: 'deleted',
                modelType: class_basename($model),
                modelId: $model->getKey(),
            );
        });

        if (method_exists(static::class, 'restored')) {
            static::restored(function (Model $model) {
                ActivityLog::log(
                    action: 'restored',
                    modelType: class_basename($model),
                    modelId: $model->getKey(),
                );
            });
        }
    }

    /**
     * Strip timestamps, soft-delete markers, and hidden/sensitive attributes
     * (passwords, tokens) before persisting them into the audit trail.
     */
    protected function attributesForActivityLog(array $attributes): array
    {
        $excluded = array_merge(
            ['created_at', 'updated_at', 'deleted_at', 'password', 'remember_token'],
            $this->getHidden(),
            property_exists($this, 'activityLogExcluded') ? $this->activityLogExcluded : [],
        );

        return array_diff_key($attributes, array_flip($excluded));
    }
}
