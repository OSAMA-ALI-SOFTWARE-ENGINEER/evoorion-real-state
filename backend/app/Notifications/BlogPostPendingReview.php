<?php

namespace App\Notifications;

use App\Models\BlogPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BlogPostPendingReview extends Notification
{
    use Queueable;

    public function __construct(public readonly BlogPost $post) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'     => 'blog_post_pending',
            'post_id'  => $this->post->id,
            'title'    => $this->post->title,
            'author'   => $this->post->author?->name ?? 'Unknown',
            'message'  => "\"{$this->post->title}\" is pending your review",
        ];
    }
}
