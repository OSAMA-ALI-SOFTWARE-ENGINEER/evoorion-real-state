<?php

namespace App\Notifications;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeadAssigned extends Notification
{
    use Queueable;

    public function __construct(public readonly Lead $lead) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New Lead Assigned: {$this->lead->name}")
            ->line("A new lead has been assigned to you.")
            ->line("Name: {$this->lead->name}")
            ->line("Email: {$this->lead->email}")
            ->line("Source: {$this->lead->source}")
            ->line('Please follow up as soon as possible.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'     => 'lead_assigned',
            'lead_id'  => $this->lead->id,
            'name'     => $this->lead->name,
            'email'    => $this->lead->email,
            'source'   => $this->lead->source,
            'message'  => "You have been assigned a new lead: {$this->lead->name}",
        ];
    }
}
