<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\LeadAssigned;
use App\Notifications\LeadStatusChanged;

class LeadObserver
{
    public function created(Lead $lead): void
    {
        ActivityLog::log(
            action: 'created',
            modelType: 'Lead',
            modelId: $lead->id,
            changes: ['after' => $lead->toArray()],
        );
    }

    public function updated(Lead $lead): void
    {
        $before = $lead->getOriginal();
        $after  = $lead->getChanges();

        if (empty($after)) {
            return;
        }

        ActivityLog::log(
            action: 'updated',
            modelType: 'Lead',
            modelId: $lead->id,
            changes: ['before' => array_intersect_key($before, $after), 'after' => $after],
        );

        // Notify newly assigned agent
        if (isset($after['assigned_to']) && $after['assigned_to']) {
            $assignedUser = User::find($after['assigned_to']);
            $assignedUser?->notify(new LeadAssigned($lead));
        }

        // Notify assigned agent of status change
        if (isset($after['status']) && $lead->assigned_to) {
            $assignedUser = User::find($lead->assigned_to);
            $assignedUser?->notify(new LeadStatusChanged($lead, $before['status'], $after['status']));
        }
    }

    public function deleted(Lead $lead): void
    {
        ActivityLog::log(
            action: 'deleted',
            modelType: 'Lead',
            modelId: $lead->id,
        );
    }

    public function restored(Lead $lead): void
    {
        ActivityLog::log(
            action: 'restored',
            modelType: 'Lead',
            modelId: $lead->id,
        );
    }
}
