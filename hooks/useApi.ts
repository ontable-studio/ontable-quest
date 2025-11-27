import { useState, useCallback } from "react";
import { ApiResponse } from "@/types/common";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  immediate?: boolean;
}

export function useApi<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const { onSuccess, onError, immediate = false } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFn();

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Request failed");
      }

      setData(response.data);
      onSuccess?.(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Execute immediately if requested
  if (immediate && !data && !loading && !error) {
    execute();
  }

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}