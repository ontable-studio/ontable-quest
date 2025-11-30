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
import { Edit } from "lucide-react";
import { ProfileForm } from "@/components/forms/profile-form";

interface ChangeProfileDialogProps {
  user?: AuthUser | null;
  children: React.ReactNode;
  onUpdate?: (updatedUser: AuthUser) => void;
}

export function ChangeProfileDialog({
  user,
  children,
  onUpdate,
}: ChangeProfileDialogProps) {
  const [open, setOpen] = useState(false);

  const handleProfileUpdateSuccess = (updatedUser: AuthUser) => {
    // Call onUpdate callback if provided
    if (onUpdate) {
      onUpdate(updatedUser);
    }

    // Show success toast
    toast.success("Profile updated successfully!", {
      description: "Your changes have been saved.",
    });

    // Close dialog after success
    setOpen(false);
  };

  const handleProfileUpdateError = (error: string) => {
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
            <Edit className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information. Changes will be reflected across
            the application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ProfileForm
            user={user}
            onSuccess={handleProfileUpdateSuccess}
            onError={handleProfileUpdateError}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
