"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthUser } from "@/types/common";
import { ChangeEmailValues, changeEmailSchema } from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { Mail, Lock, AlertTriangle, Loader2, X } from "lucide-react";

interface ChangeEmailFormProps {
  user?: AuthUser | null;
  onSuccess?: (requiresReauth: boolean) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function ChangeEmailForm({
  user,
  onSuccess,
  onError,
  onCancel,
}: ChangeEmailFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  const onSubmit = async (data: ChangeEmailValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/email", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess?.(result.data?.requiresReauth);
        form.reset();
      } else {
        const errorMessage = result.error?.message || "Failed to change email";

        // Set field-specific errors if needed
        if (errorMessage.toLowerCase().includes("password")) {
          form.setError("password", { message: errorMessage });
        } else {
          form.setError("root", { message: errorMessage });
        }

        onError?.(errorMessage);
      }
    } catch (error) {
      console.error("Email change error:", error);
      const errorMessage = "Network error. Please try again.";
      form.setError("root", { message: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't allow OAuth users to change email
  const canChangeEmail = user?.provider === "credentials";

  if (!canChangeEmail) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Email changes are only available for accounts created with email and
          password. Your account was created using{" "}
          {user?.provider === "github" ? "GitHub" : "OAuth"}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Email Display */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium mb-1">
          <Mail className="h-4 w-4" />
          Current Email Address
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          {user?.email}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* New Email Field */}
          <FormField
            control={form.control}
            name="newEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  New Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter new email address"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Current Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your current password"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  For security, we need to confirm your current password before
                  making changes.
                </p>
              </FormItem>
            )}
          />

          {/* Form Error */}
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Email...
                </>
              ) : (
                "Change Email"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
