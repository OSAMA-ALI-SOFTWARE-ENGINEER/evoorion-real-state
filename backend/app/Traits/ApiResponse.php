<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Return a success response with consistent JSON envelope format
     *
     * @param mixed $data The data to include in the response
     * @param string $message Success message
     * @param int $statusCode HTTP status code
     * @return JsonResponse
     */
    protected function success(mixed $data = null, string $message = 'Operation successful', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => [],
        ], $statusCode);
    }

    /**
     * Return an error response with consistent JSON envelope format
     *
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @param array $errors Optional error details
     * @return JsonResponse
     */
    protected function error(string $message = 'Operation failed', ?array $errors = null, int $statusCode = 400): JsonResponse
    {
        $meta = [];
        if ($errors !== null) {
            $meta['errors'] = $errors;
        }

        return response()->json([
            'success' => false,
            'data' => null,
            'message' => $message,
            'meta' => $meta,
        ], $statusCode);
    }

    /**
     * Return a paginated response with consistent JSON envelope format
     *
     * @param mixed $data Paginated collection/items
     * @param int $total Total number of items
     * @param int $perPage Items per page
     * @param int $currentPage Current page number
     * @param string $message Success message
     * @return JsonResponse
     */
    protected function paginated(mixed $data, int $total, int $perPage, int $currentPage, string $message = 'Operation successful'): JsonResponse
    {
        $lastPage = (int) ceil($total / $perPage);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => [
                'pagination' => [
                    'current_page' => $currentPage,
                    'total' => $total,
                    'per_page' => $perPage,
                    'last_page' => $lastPage,
                ],
            ],
        ], 200);
    }
}
