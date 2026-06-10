@component('mail::message')
# New Lead Received

A new enquiry has been submitted{{ $lead->property_id && $lead->property->id ? ' for **' . $lead->property->title . '**' : '' }}.

@component('mail::table')
| Field | Details |
|:------|:--------|
| **Name** | {{ $lead->name }} |
| **Email** | {{ $lead->email }} |
| **Phone** | {{ $lead->phone ?? '—' }} |
| **WhatsApp** | {{ $lead->whatsapp ?? '—' }} |
| **Source** | {{ ucfirst($lead->source) }} |
| **Budget** | @if($lead->budget_min) AED {{ number_format((float)$lead->budget_min) }} – AED {{ number_format((float)$lead->budget_max) }} @else Not specified @endif |
| **Submitted** | {{ $lead->created_at->format('d M Y, H:i') }} UTC |
@endcomponent

@if ($lead->message)
**Message:**
> {{ $lead->message }}

@endif

@component('mail::button', ['url' => config('app.url') . '/admin/leads', 'color' => 'primary'])
View Lead in Admin Panel
@endcomponent

Thanks,<br>
**EVOORION System**
@endcomponent
