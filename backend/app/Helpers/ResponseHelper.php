<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ResponseHelper
{
    /**
     * Return a success response with consistent JSON envelope format
     *
     * @param mixed $data The data to include in the response
     * @param string $message Success message
     * @param int $code HTTP status code
     * @return JsonResponse
     */
    public static function success(mixed $data = null, string $message = 'Operation successful', int $statusCode = 200, array $meta = []): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => $meta,
        ], $statusCode);
    }

    /**
     * Return an error response with consistent JSON envelope format
     *
     * @param string $message Error message
     * @param int $code HTTP status code
     * @param mixed $data Optional error details
     * @return JsonResponse
     */
    public static function error(string $message = 'An error occurred', int $statusCode = 400, array $errors = [], mixed $data = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data' => $data,
            'message' => $message,
            'meta' => empty($errors) ? [] : ['errors' => $errors],
        ], $statusCode);
    }

    /**
     * Return a paginated response with consistent JSON envelope format
     *
     * @param mixed $items Paginated collection/items
     * @param string $message Success message
     * @param int $code HTTP status code
     * @return JsonResponse
     */
    public static function paginated(mixed $items, string $message = 'Success', int $code = 200): JsonResponse
    {
        $meta = [];

        // Extract pagination meta information if available
        if (is_object($items) && method_exists($items, 'toArray')) {
            $itemsArray = $items->toArray();
            if (isset($itemsArray['meta'])) {
                $meta = $itemsArray['meta'];
            }
            if (isset($itemsArray['links'])) {
                $meta['links'] = $itemsArray['links'];
            }
        }

        return response()->json([
            'success' => true,
            'data' => is_object($items) && method_exists($items, 'items') ? $items->items() : $items,
            'message' => $message,
            'meta' => $meta,
        ], $code);
    }
}
