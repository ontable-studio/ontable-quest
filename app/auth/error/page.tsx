"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Info } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorDescription = (error: string | null) => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return {
          title: "Account Already Exists",
          message:
            "The email address associated with your GitHub account is already linked to an existing account. You can now sign in with GitHub using your existing account.",
          action: "Try signing in again with GitHub",
        };
      case "CredentialsSignin":
        return {
          title: "Invalid Credentials",
          message: "The email or password you entered is incorrect.",
          action: "Try again with correct credentials",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "You do not have permission to sign in.",
          action: "Contact support if you believe this is an error",
        };
      case "Verification":
        return {
          title: "Email Verification Required",
          message: "Please verify your email address before signing in.",
          action: "Check your email for verification link",
        };
      case "Configuration":
        return {
          title: "Service Unavailable",
          message:
            "The authentication service is temporarily unavailable. Please try again later.",
          action: "Try again in a few minutes or contact support",
        };
      case "Default":
        return {
          title: "Authentication Error",
          message: "An error occurred during authentication.",
          action: "Try signing in again",
        };
      default:
        return {
          title: "Authentication Error",
          message: "An unknown error occurred during authentication.",
          action: "Try signing in again",
        };
    }
  };

  const errorInfo = getErrorDescription(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>{errorInfo.title}</CardTitle>
            <CardDescription>{errorInfo.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Error Code:</strong> {error || "Unknown"}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Suggested action:</strong> {errorInfo.action}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/auth/signin">
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>

            {error === "OAuthAccountNotLinked" && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Your GitHub account has been successfully
                  linked to your existing account. You can now use either sign-in
                  method.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          Loading...
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
