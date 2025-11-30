"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  title?: string;
  description?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              {this.props.title || "Something went wrong"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-red-700">
                {this.props.description ||
                  "An error occurred while loading this content. Please try refreshing the page."}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-200 text-red-800 hover:bg-red-100"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() =>
                    this.setState({ hasError: false, error: undefined })
                  }
                  variant="ghost"
                  className="text-red-800 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
              {(this.props.showDetails ?? false) && this.state.error && (
                <details className="text-xs text-red-600 mt-4">
                  <summary className="cursor-pointer">Error details</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export interface UseErrorBoundaryState {
  error: Error | null;
  reset: () => void;
}

export function useErrorBoundary(): UseErrorBoundaryState {
  const [error, setError] = React.useState<Error | null>(null);

  const reset = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { error: null, reset };
}
