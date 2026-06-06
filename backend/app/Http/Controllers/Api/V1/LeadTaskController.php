<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Lead Tasks
 *
 * Follow-up tasks attached to leads. Agents can manage tasks only on their own leads.
 */
class LeadTaskController extends Controller
{
    public function index(Lead $lead): JsonResponse
    {
        $this->authorize('view', $lead);

        $tasks = $lead->tasks()
            ->with('user')
            ->orderByRaw('completed_at IS NULL DESC')
            ->orderBy('due_date')
            ->get();

        return response()->json(['success' => true, 'data' => $tasks]);
    }

    public function store(Lead $lead, Request $request): JsonResponse
    {
        $this->authorize('update', $lead);

        $validated = $request->validate([
            'title'    => 'required|string|max:255',
            'notes'    => 'sometimes|nullable|string|max:2000',
            'due_date' => 'sometimes|nullable|date|after_or_equal:today',
        ]);

        $task = $lead->tasks()->create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return response()->json(['success' => true, 'data' => $task->fresh()->load('user')], 201);
    }

    public function update(Lead $lead, LeadTask $task, Request $request): JsonResponse
    {
        $this->authorize('update', $lead);

        if ($task->lead_id !== $lead->id) {
            return response()->json(['success' => false, 'message' => 'Task not found on this lead'], 404);
        }

        $validated = $request->validate([
            'title'    => 'sometimes|string|max:255',
            'notes'    => 'sometimes|nullable|string|max:2000',
            'due_date' => 'sometimes|nullable|date',
        ]);

        $task->update($validated);

        return response()->json(['success' => true, 'data' => $task->fresh()->load('user')]);
    }

    public function destroy(Lead $lead, LeadTask $task): JsonResponse
    {
        $this->authorize('update', $lead);

        if ($task->lead_id !== $lead->id) {
            return response()->json(['success' => false, 'message' => 'Task not found on this lead'], 404);
        }

        $task->delete();

        return response()->json(['success' => true]);
    }

    public function complete(Lead $lead, LeadTask $task): JsonResponse
    {
        $this->authorize('update', $lead);

        if ($task->lead_id !== $lead->id) {
            return response()->json(['success' => false, 'message' => 'Task not found on this lead'], 404);
        }

        $task->update(['completed_at' => $task->completed_at ? null : now()]);

        return response()->json([
            'success' => true,
            'data'    => $task->fresh(),
            'message' => $task->isCompleted() ? 'Task marked complete' : 'Task reopened',
        ]);
    }
}
