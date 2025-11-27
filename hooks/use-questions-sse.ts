"use client";

import { useState, useCallback, useRef } from "react";
import { Question } from "@/types/common";
import { toast } from "sonner";

export function useQuestionsSSE() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const connectToSSE = useCallback(
    async (onNewQuestion: (question: Question) => void) => {
      // Abort any existing connection
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setIsConnected(true);
        setError(null);

        const response = await fetch('/api/questions/stream', {
          signal: abortControllerRef.current.signal,
        });

        if (!response.body) {
          throw new Error('No response body');
        }

        // To decode incoming data as a string
        const reader = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();

        let incomingMessage = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            setIsConnected(false);
            break;
          }

          if (value) {
            try {
              const lines = value.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6));

                    if (data.type === 'new-question' && data.question) {
                      onNewQuestion(data.question);
                      toast.success("New question received!", {
                        description: `${data.question.name || "Anonymous"} asked a question`,
                        duration: 3000,
                      });
                    } else if (data.type === 'connected') {
                      console.log('SSE connected:', data.timestamp);
                    }
                  } catch (parseError) {
                    console.error('Failed to parse SSE message:', parseError);
                  }
                }
              }
            } catch (error) {
              console.error('Error processing SSE data:', error);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to SSE');
        setIsConnected(false);

        // Don't show error toast for connection errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (!errorMessage.includes('AbortError')) {
          console.error('SSE connection error:', err);
        }
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    isConnected,
    error,
    connectToSSE,
    disconnect,
  };
}
