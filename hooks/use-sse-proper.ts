"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Question } from "@/types/common";

interface SSEMessage {
  type: 'new-question' | 'connected';
  question?: Question;
  timestamp?: string;
}

interface UseSSEOptions {
  onNewQuestion?: (question: Question) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoConnect?: boolean;
}

export function useSSEProper(options: UseSSEOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 1000;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource('/api/questions/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        options.onConnect?.();
        console.log('SSE connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);
          setLastMessage(data);

          if (data.type === 'new-question' && data.question) {
            options.onNewQuestion?.(data.question);
          } else if (data.type === 'connected') {
            console.log('SSE connected:', data.timestamp);
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        setIsConnected(false);
        options.onError?.(error);

        // Try to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      options.onError?.(error as Event);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    options.onDisconnect?.();
  }, [options]);

  // Auto-connect on mount only if autoConnect is true
  useEffect(() => {
    if (options.autoConnect) {
      connect();

      return () => {
        disconnect();
      };
    }
  }, [connect, disconnect, options.autoConnect]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
  };
}