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
import { Lock } from "lucide-react";
import { ChangePasswordForm } from "@/components/forms/change-password-form";

interface ChangePasswordDialogProps {
  user?: AuthUser | null;
  children: React.ReactNode;
}

export function ChangePasswordDialog({
  user,
  children,
}: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);

  const handlePasswordChangeSuccess = () => {
    // Show success toast
    toast.success("Password changed successfully!", {
      description:
        "Your password has been updated and your account is secure.",
    });

    // Close dialog after success
    setOpen(false);
  };

  const handlePasswordChangeError = (error: string) => {
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
            <Lock className="h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Update your account password for better security.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ChangePasswordForm
            user={user}
            onSuccess={handlePasswordChangeSuccess}
            onError={handlePasswordChangeError}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
