<?php

namespace App\Notifications;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeadStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Lead $lead,
        public readonly string $oldStatus,
        public readonly string $newStatus
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Lead Status Updated: {$this->lead->name}")
            ->line("The status of lead \"{$this->lead->name}\" has been updated.")
            ->line("Previous status: {$this->oldStatus}")
            ->line("New status: {$this->newStatus}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'lead_status_changed',
            'lead_id'    => $this->lead->id,
            'name'       => $this->lead->name,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message'    => "Lead \"{$this->lead->name}\" status changed from {$this->oldStatus} to {$this->newStatus}",
        ];
    }
}
