<?php

namespace App\Services;

use App\Mail\LeadConfirmation;
use App\Mail\LeadNotification;
use App\Models\Agent;
use App\Models\Lead;
use App\Models\LeadNote;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadService
{
    public function __construct(private SettingService $settings) {}

    public function createLead(array $data): Lead
    {
        $lead = Lead::create($data);

        // Eagerly load property with developer and primary agent for email templates
        if ($lead->property_id) {
            $lead->load(['property.developer', 'property.primaryAgent']);
        }

        $this->sendEmails($lead);

        return $lead;
    }

    private function sendEmails(Lead $lead): void
    {
        // 1. Confirmation to the lead submitter
        if ($lead->email && filter_var($lead->email, FILTER_VALIDATE_EMAIL)) {
            try {
                Mail::to($lead->email)->send(new LeadConfirmation($lead));
            } catch (\Throwable $e) {
                Log::warning('LeadConfirmation email failed', [
                    'lead_id' => $lead->id,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        // 2. Internal notification to configured staff recipients
        $recipients = $this->collectNotificationRecipients($lead);

        if (!empty($recipients)) {
            try {
                Mail::to($recipients)->send(new LeadNotification($lead));
            } catch (\Throwable $e) {
                Log::warning('LeadNotification email failed', [
                    'lead_id'    => $lead->id,
                    'recipients' => $recipients,
                    'error'      => $e->getMessage(),
                ]);
            }
        }
    }

    private function collectNotificationRecipients(Lead $lead): array
    {
        $recipients = [];

        // a) Always-on list from settings (comma-separated)
        $rawList = $this->settings->get('lead_notify_recipients');
        if ($rawList) {
            foreach (explode(',', $rawList) as $email) {
                $email = trim($email);
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $recipients[] = $email;
                }
            }
        }

        // b) Primary agent of the property (if toggle is on)
        if ($this->settings->get('lead_notify_agent') === '1' && $lead->property_id) {
            $agentUser = optional($lead->property)->primaryAgent;
            if ($agentUser && filter_var($agentUser->email, FILTER_VALIDATE_EMAIL)) {
                $recipients[] = $agentUser->email;
            }
        }

        // c) Developer of the property (if toggle is on and developer has email)
        if ($this->settings->get('lead_notify_developer') === '1' && $lead->property_id) {
            $developer = optional($lead->property)->developer;
            if ($developer && filter_var($developer->email ?? '', FILTER_VALIDATE_EMAIL)) {
                $recipients[] = $developer->email;
            }
        }

        return array_values(array_unique(array_filter($recipients)));
    }

    public function assignLead(int $leadId, int $agentId): Lead
    {
        $lead = Lead::findOrFail($leadId);
        $agent = Agent::findOrFail($agentId);

        $lead->update(['assigned_to' => $agent->user_id]);

        return $lead;
    }

    public function changeStatus(int $leadId, string $status): Lead
    {
        $lead = Lead::findOrFail($leadId);
        $lead->update(['status' => $status]);

        return $lead;
    }

    public function addNote(int $leadId, string $noteText): LeadNote
    {
        return LeadNote::create([
            'lead_id' => $leadId,
            'user_id' => auth()->id(),
            'note'    => $noteText,
        ]);
    }

    private function csvSafe(?string $value): string
    {
        if ($value === null) {
            return '';
        }
        return preg_match('/^[=+\-@\t\r]/', $value) ? "'" . $value : $value;
    }

    public function exportCSV(array $filters): StreamedResponse
    {
        $query = Lead::query()
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->byStatus($s))
            ->when($filters['date_from'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filters['date_to'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderBy('created_at', 'desc');

        return response()->streamDownload(function () use ($query) {
            $csv = fopen('php://output', 'w');
            fputcsv($csv, ['ID', 'Name', 'Email', 'Phone', 'WhatsApp', 'Status', 'Source', 'Budget Min', 'Budget Max', 'Assigned To', 'Created At']);

            $query->chunk(100, function ($leads) use ($csv) {
                foreach ($leads as $lead) {
                    fputcsv($csv, [
                        $lead->id,
                        $this->csvSafe($lead->name),
                        $this->csvSafe($lead->email),
                        $this->csvSafe($lead->phone),
                        $this->csvSafe($lead->whatsapp),
                        $lead->status,
                        $lead->source,
                        $lead->budget_min,
                        $lead->budget_max,
                        $this->csvSafe($lead->assignedUser?->name ?? 'Unassigned'),
                        $lead->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($csv);
        }, 'leads_export_' . now()->format('Y-m-d') . '.csv');
    }
}
