<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    public function view(User $user, Lead $lead): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }
        // Agents can see leads assigned to them or unassigned leads
        return $user->hasRole('agent') &&
            ($lead->assigned_to === null || $lead->assigned_to === $user->id);
    }

    public function update(User $user, Lead $lead): bool
    {
        if ($user->hasRole('manager')) {
            return true;
        }
        return $user->hasRole('agent') && $lead->assigned_to === $user->id;
    }

    public function delete(User $user, Lead $lead): bool
    {
        return $this->update($user, $lead);
    }

    public function addNote(User $user, Lead $lead): bool
    {
        return $this->update($user, $lead);
    }

    public function deleteNote(User $user, Lead $lead): bool
    {
        return $this->update($user, $lead);
    }

    public function addDocument(User $user, Lead $lead): bool
    {
        return $this->update($user, $lead);
    }

    public function deleteDocument(User $user, Lead $lead): bool
    {
        return $this->update($user, $lead);
    }

    public function restore(User $user, Lead $_lead): bool
    {
        return $user->hasRole('manager');
    }
}
