"use client";

import React, { useState } from "react";
import { AuthUser } from "@/types/common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { ChangeEmailForm } from "@/components/forms/change-email-form";

interface ChangeEmailDialogProps {
  user?: AuthUser | null;
  children: React.ReactNode;
  onEmailChanged?: () => void;
}

export function ChangeEmailDialog({
  user,
  children,
  onEmailChanged,
}: ChangeEmailDialogProps) {
  const [open, setOpen] = useState(false);

  const handleEmailChangeSuccess = (requiresReauth: boolean) => {
    // Show success toast
    toast.success("Email updated successfully!", {
      description: requiresReauth
        ? "Please check your new email for verification. You may need to sign in again."
        : "Your email has been updated.",
    });

    // Call onEmailChanged callback if provided
    if (onEmailChanged && requiresReauth) {
      onEmailChanged();
    }

    // Close dialog after success
    setOpen(false);
  };

  const handleEmailChangeError = (error: string) => {
    // Error handling is done by the form component
    // This callback is for any additional error handling if needed
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email Address
          </DialogTitle>
          <DialogDescription>
            Update your email address. You&apos;ll need to verify your new email
            address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ChangeEmailForm
            user={user}
            onSuccess={handleEmailChangeSuccess}
            onError={handleEmailChangeError}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
