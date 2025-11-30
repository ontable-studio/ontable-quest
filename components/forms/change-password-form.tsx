"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthUser } from "@/types/common";
import {
  ChangePasswordValues,
  changePasswordSchema,
} from "@/lib/validations/auth";
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
import {
  Lock,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  X,
} from "lucide-react";

interface ChangePasswordFormProps {
  user?: AuthUser | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function ChangePasswordForm({
  user,
  onSuccess,
  onError,
  onCancel,
}: ChangePasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess?.();
        form.reset();
      } else {
        const errorMessage =
          result.error?.message || "Failed to change password";

        // Set field-specific errors if password is incorrect
        if (errorMessage.toLowerCase().includes("incorrect")) {
          form.setError("currentPassword", {
            message: "Current password is incorrect",
          });
        } else {
          form.setError("root", { message: errorMessage });
        }

        onError?.(errorMessage);
      }
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage = "Network error. Please try again.";
      form.setError("root", { message: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't allow OAuth users to change password
  const canChangePassword = user?.provider === "credentials";

  const getPasswordStrength = (password: string) => {
    if (!password) return { color: "text-gray-400", text: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { color: "text-red-500", text: "Weak" };
    if (score <= 3) return { color: "text-yellow-500", text: "Fair" };
    if (score <= 4) return { color: "text-blue-500", text: "Good" };
    return { color: "text-green-500", text: "Strong" };
  };

  const newPassword = form.watch("newPassword");
  const passwordStrength = getPasswordStrength(newPassword);

  if (!canChangePassword) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Password changes are only available for accounts created with email
          and password. Your account was created using{" "}
          {user?.provider === "github" ? "GitHub" : "OAuth"}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password Field */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Current Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      {...field}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      disabled={isSubmitting}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New Password Field */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...field}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isSubmitting}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                {newPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      Password strength:
                    </span>
                    <span className={`font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li
                      className={
                        newPassword.length >= 8 ? "text-green-600" : ""
                      }
                    >
                      At least 8 characters
                    </li>
                    <li
                      className={
                        /[a-z]/.test(newPassword) ? "text-green-600" : ""
                      }
                    >
                      One lowercase letter
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(newPassword) ? "text-green-600" : ""
                      }
                    >
                      One uppercase letter
                    </li>
                    <li
                      className={/\d/.test(newPassword) ? "text-green-600" : ""}
                    >
                      One number
                    </li>
                  </ul>
                </div>
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      {...field}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
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
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
