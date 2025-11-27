import { useEffect, useState, useCallback, useRef } from "react";
import { AsyncResult } from "@/types/common";

interface UsePollingOptions<T> {
  interval?: number;
  immediate?: boolean;
  onError?: (error: string) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: UsePollingOptions<T> = {}
): AsyncResult<T> & { start: () => void; stop: () => void; isPolling: boolean } {
  const {
    interval = 5000,
    immediate = true,
    onError,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Store the fetch function in a ref to avoid recreating executeFetch
  const fetchFnRef = useRef(fetchFn);
  const onErrorRef = useRef(onError);
  const intervalRefConfig = useRef(interval);
  const maxRetriesRef = useRef(maxRetries);
  const retryDelayRef = useRef(retryDelay);

  // Update refs when values change
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    intervalRefConfig.current = interval;
  }, [interval]);

  useEffect(() => {
    maxRetriesRef.current = maxRetries;
  }, [maxRetries]);

  useEffect(() => {
    retryDelayRef.current = retryDelay;
  }, [retryDelay]);

  const executeFetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      setData(result);
      retryCountRef.current = 0; // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);

      // Retry logic
      retryCountRef.current += 1;
      if (retryCountRef.current <= maxRetriesRef.current && retryDelayRef.current > 0) {
        setTimeout(executeFetch, retryDelayRef.current * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - uses refs instead

  const start = useCallback(() => {
    if (isPolling) return;

    setIsPolling(true);
    if (immediate) {
      executeFetch();
    }

    if (intervalRefConfig.current > 0) {
      intervalRef.current = setInterval(executeFetch, intervalRefConfig.current);
    }
  }, [isPolling, immediate, executeFetch]);

  const stop = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refetch = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  useEffect(() => {
    start();
    return stop;
  }, []); // Only run once on mount

  return {
    data,
    loading,
    error,
    refetch,
    start,
    stop,
    isPolling,
  };
}