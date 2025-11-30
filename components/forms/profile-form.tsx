"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthUser } from "@/types/common";
import { ProfileFormValues, profileFormSchema } from "@/lib/validations/auth";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, Loader2, User, Mail, Shield, X } from "lucide-react";

interface ProfileFormProps {
  user?: AuthUser | null;
  onSuccess?: (updatedUser: AuthUser) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function ProfileForm({
  user,
  onSuccess,
  onError,
  onCancel,
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      avatar: user?.avatar || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          avatar: data.avatar || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Create updated user object
        const updatedUser: AuthUser = {
          ...user!,
          name: data.name,
          avatar: data.avatar || undefined,
        };

        onSuccess?.(updatedUser);
      } else {
        const errorMessage =
          result.error?.message || "Failed to update profile";
        form.setError("root", { message: errorMessage });
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage = "Network error. Please try again.";
      form.setError("root", { message: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Early return if user is not available
  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load user profile. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Profile Preview */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                <AvatarImage src={user.avatar || ""} alt={user.name || ""} />
                <AvatarFallback className="text-sm">
                  {user.name?.charAt(0)?.toUpperCase() ||
                    user.email?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent align="center">
              <p>Current avatar</p>
            </TooltipContent>
          </Tooltip>

          {/* Make this ELASTIC */}
          <div className="flex-1 w-0 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium text-sm sm:text-base truncate">
                  {user?.name || "Anonymous User"}
                </div>
              </TooltipTrigger>
              <TooltipContent align="start">
                <p>{user?.name || "Anonymous User"}</p>
              </TooltipContent>
            </Tooltip>

            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 min-w-0">
              <Mail className="h-3 w-3 shrink-0" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate">{user?.email}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  <p>{user?.email}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Let badge shrink */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={user?.role === "admin" ? "default" : "secondary"}
                className="text-xs"
              >
                <Shield className="h-3 w-3 mr-1" />
                {user?.role === "admin" ? "Admin" : "User"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent align="center">
              <p>
                {user?.role === "admin"
                  ? "Administrator with full access"
                  : "Standard user account"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Display Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Avatar URL Field */}
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
                {field.value && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">
                      Preview:
                    </span>
                    <div className="mt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={field.value} alt="Avatar preview" />
                        <AvatarFallback>
                          {field.value ? "IMG" : "NO"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                )}
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
