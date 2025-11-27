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

// Use a singleton pattern with proper cleanup
class SSEManager {
  private static instance: SSEManager | null = null;
  private eventSource: EventSource | null = null;
  private listeners: Set<(question: Question) => void> = new Set();
  private connectionCount: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  private constructor() {}

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  connect(): void {
    if (this.eventSource || this.connectionCount > 0) {
      this.connectionCount++;
      return;
    }

    try {
      this.eventSource = new EventSource('/api/questions/stream');
      this.connectionCount = 1;

      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.reconnectAttempts = 0;
        this.reconnectTimeout = null;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);

          if (data.type === 'new-question' && data.question) {
            // Notify all listeners
            this.listeners.forEach(listener => {
              try {
                listener(data.question!);
              } catch (error) {
                console.error('Error in SSE listener:', error);
              }
            });
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
      this.reconnectAttempts++;

      this.reconnectTimeout = setTimeout(() => {
        console.log(`SSE reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.eventSource = null;
        this.connectionCount = 0;
        this.connect();
      }, delay);
    } else {
      console.error('Max SSE reconnection attempts reached');
      this.cleanup();
    }
  }

  addListener(listener: (question: Question) => void): string {
    const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.listeners.add(listener);

    if (this.connectionCount === 0) {
      this.connect();
    } else {
      this.connectionCount++;
    }

    return listenerId;
  }

  removeListener(listener: (question: Question) => void): void {
    this.listeners.delete(listener);
    this.connectionCount--;

    if (this.connectionCount <= 0) {
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.connectionCount = 0;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.connectionCount > 0;
  }
}

export function useSSEStable(options: UseSSEOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const listenerRef = useRef<((question: Question) => void) | null>(null);
  const managerRef = useRef<SSEManager | null>(null);

  const connect = useCallback(() => {
    if (!managerRef.current) {
      managerRef.current = SSEManager.getInstance();
    }

    const manager = managerRef.current;

    if (options.onNewQuestion) {
      listenerRef.current = options.onNewQuestion;
      manager.addListener(options.onNewQuestion);
    } else {
      manager.connect();
    }

    setIsConnected(manager.isConnected());
  }, [options.onNewQuestion]);

  const disconnect = useCallback(() => {
    const manager = managerRef.current;
    if (manager && listenerRef.current) {
      manager.removeListener(listenerRef.current);
      listenerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
  };
}