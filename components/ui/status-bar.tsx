import React from "react";
import { Button } from "./button";
import { RefreshCw, Check, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusBarProps {
  count?: number;
  countLabel?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  status?: "default" | "success" | "warning" | "error";
  message?: string;
  className?: string;
}

export function StatusBar({
  count,
  countLabel,
  onRefresh,
  isLoading = false,
  status = "default",
  message,
  className,
}: StatusBarProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <Check className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className={cn("flex items-center justify-between text-sm", getStatusColor(), className)}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        {count !== undefined && (
          <span>
            {count} {countLabel || "items"}
            {count !== 1 && countLabel ? "" : "s"}
          </span>
        )}
        {message && <span>{message}</span>}
      </div>

      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      )}
    </div>
  );
}

// Live status indicator for real-time features
export interface LiveStatusProps {
  isLive: boolean;
  label?: string;
  className?: string;
}

export function LiveStatus({ isLive, label = "Live", className }: LiveStatusProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <div className={cn(
        "h-2 w-2 rounded-full",
        isLive ? "bg-green-500" : "bg-yellow-500"
      )} />
      <span>{isLive ? label : "Connecting"}</span>
    </div>
  );
}