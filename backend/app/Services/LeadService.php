<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Lead;
use App\Models\LeadNote;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadService
{
    public function createLead(array $data): Lead
    {
        return Lead::create($data);
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
            'note' => $noteText,
        ]);
    }

    private function csvSafe(?string $value): string
    {
        if ($value === null) {
            return '';
        }
        // Prefix with single-quote if value starts with a spreadsheet formula trigger character
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
