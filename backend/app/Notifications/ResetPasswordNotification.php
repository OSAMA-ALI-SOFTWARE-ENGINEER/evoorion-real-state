<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public function __construct(protected string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset Your Password')
            ->line('You requested a password reset. Use the token below within 60 minutes.')
            ->line('Token: ' . $this->token)
            ->line('If you did not request a password reset, no action is required.');
    }
}
