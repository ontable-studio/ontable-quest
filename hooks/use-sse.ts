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
}

// Global state to prevent multiple SSE connections
let globalEventSource: EventSource | null = null;
let globalConnectionCount = 0;
const globalListeners = new Map<string, (question: Question) => void>();

export function useSSE(options: UseSSEOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const listenerIdRef = useRef<string | null>(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 1000;

  const connect = useCallback(() => {
    // Only connect if we're not already connected and this is the first listener
    if (globalEventSource || globalConnectionCount > 0) {
      setIsConnected(true);
      return;
    }

    try {
      globalEventSource = new EventSource('/api/questions/stream');
      globalConnectionCount = 1;

      globalEventSource.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        options.onConnect?.();
        console.log('SSE connection established');
      };

      globalEventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);
          setLastMessage(data);

          if (data.type === 'new-question' && data.question) {
            // Notify all listeners
            globalListeners.forEach(listener => {
              try {
                listener(data.question!);
              } catch (error) {
                console.error('Error in SSE listener:', error);
              }
            });
            options.onNewQuestion?.(data.question);
          } else if (data.type === 'connected') {
            console.log('SSE connected:', data.timestamp);
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      globalEventSource.onerror = (error) => {
        setIsConnected(false);
        options.onError?.(error);

        // Try to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
            globalEventSource = null;
            globalConnectionCount = 0;
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
          globalEventSource = null;
          globalConnectionCount = 0;
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

    if (listenerIdRef.current) {
      globalListeners.delete(listenerIdRef.current);
      listenerIdRef.current = null;
    }

    globalConnectionCount--;

    // Only close the connection if no more listeners
    if (globalConnectionCount <= 0 && globalEventSource) {
      globalEventSource.close();
      globalEventSource = null;
      globalConnectionCount = 0;
      setIsConnected(false);
      console.log('SSE connection closed');
    }

    options.onDisconnect?.();
  }, [options]);

  // Auto-connect on mount
  useEffect(() => {
    // Add this component's listener
    if (options.onNewQuestion) {
      const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      listenerIdRef.current = listenerId;
      globalListeners.set(listenerId, options.onNewQuestion);
    }

    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.onNewQuestion]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
  };
}