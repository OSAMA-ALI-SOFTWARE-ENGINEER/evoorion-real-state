@component('mail::message')
# Thank You for Your Enquiry, {{ $lead->name }}

We've received your enquiry and one of our senior investment advisors will contact you within **2 hours** during office hours (Monday – Saturday, 9:00 AM – 7:00 PM).

---

@if ($lead->property_id && $lead->property->id)
**Property of Interest:** {{ $lead->property->title }}

@endif
@if ($lead->budget_min && $lead->budget_max)
**Your Budget:** AED {{ number_format((float) $lead->budget_min) }} – AED {{ number_format((float) $lead->budget_max) }}

@endif
@if ($lead->message)
**Your Message:**
> {{ $lead->message }}

@endif

In the meantime, feel free to explore our full portfolio of luxury properties.

@component('mail::button', ['url' => config('app.frontend_url', 'http://localhost:3000') . '/properties', 'color' => 'primary'])
View Our Portfolio
@endcomponent

If you have an urgent enquiry, you can reach us directly at **{{ config('settings.contact_phone', '+971 00 000 0000') }}** or reply to this email.

Thanks,<br>
**The EVOORION Team**<br>
*Dubai's Luxury Real Estate Experts*
@endcomponent
