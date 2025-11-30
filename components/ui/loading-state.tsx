import React from "react";
import { Card, CardContent } from "./card";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "inline" | "skeleton";
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  showIcon = true,
  size = "default",
  variant = "default",
  className,
}: LoadingStateProps) {
  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const textSizes = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-muted-foreground",
          textSizes[size],
          className,
        )}
      >
        {showIcon && (
          <RefreshCw className={cn("animate-spin", iconSizes[size])} />
        )}
        {message}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="py-4 text-center">
        <div
          className={cn(
            "flex items-center justify-center gap-2",
            textSizes[size],
            "text-muted-foreground",
          )}
        >
          {showIcon && (
            <RefreshCw className={cn("animate-spin", iconSizes[size])} />
          )}
          {message}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton list for repeated loading items
export interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

export function SkeletonList({
  count = 3,
  className,
  itemClassName,
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn("space-y-3", itemClassName)}>
          <div className="flex justify-between">
            <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
