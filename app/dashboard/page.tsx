"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/client-utils";
import { ChangeProfileDialog } from "@/components/change-profile-dialog";
import { ChangeEmailDialog } from "@/components/change-email-dialog";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User as UserIcon,
  Mail,
  Settings,
  Shield,
  LogOut,
  MessageSquare,
  Heart,
  TrendingUp,
  Zap,
  Clock,
  Star,
  ChevronDown,
  Edit,
  Key,
  Bell,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Still loading
    if (!isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state is now handled by loading.tsx
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header with welcome message */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Welcome back, {user.name?.split(" ")[0] || "User"}! 👋
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-2">
                Here&apos;s what&apos;s happening with your account today
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2 sm:size-lg"
            >
              <Link href="/">
                <LogOut className="h-4 w-4 rotate-180" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Enhanced User Profile Card with Integrated Actions */}
          <Card className="border-0 shadow-lg bg-linear-to-r from-card to-card/80 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  Profile Overview
                </CardTitle>

                {/* Account Settings Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Settings />
                      <span className="hidden sm:inline">Account Settings</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      Account Settings
                    </div>
                    <DropdownMenuSeparator />
                    {user && (
                      <ChangeProfileDialog user={user}>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                      </ChangeProfileDialog>
                    )}
                    {user && (
                      <ChangeEmailDialog user={user}>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Mail className="h-4 w-4" />
                          Change Email
                        </DropdownMenuItem>
                      </ChangeEmailDialog>
                    )}
                    {user && (
                      <ChangePasswordDialog user={user}>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Key className="h-4 w-4" />
                          Change Password
                        </DropdownMenuItem>
                      </ChangePasswordDialog>
                    )}
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <ShieldCheck className="h-4 w-4" />
                      Privacy & Security
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <HelpCircle className="h-4 w-4" />
                      Help & Support
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Mobile: Stacked layout, Tablet: Side-by-side, Desktop: Integrated layout */}

              {/* Mobile Layout - Stacked */}
              <div className="sm:hidden space-y-6">
                {/* Mobile: Avatar centered */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse opacity-75 blur-sm"></div>
                      <div className="relative bg-linear-to-br from-background to-muted rounded-full p-1 shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                        <Avatar className="h-20 w-20 rounded-full border-4 border-background/50 backdrop-blur-sm shadow-inner">
                          <AvatarImage
                            src={user.avatar || ""}
                            alt={user.name || ""}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-lg font-bold bg-linear-to-br from-primary via-purple-600 to-pink-600 text-white shadow-inner flex items-center justify-center">
                            {user.name?.charAt(0)?.toUpperCase() ||
                              user.email?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute bottom-1 right-1 flex items-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                          <div className="relative h-5 w-5 bg-green-500 rounded-full border-3 border-background shadow-lg">
                            <div className="absolute inset-1 bg-green-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Mobile: User info centered */}
                <div className="text-center space-y-4">
                  <div>
                    <div className="flex flex-col items-center gap-2">
                      <h3 className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {user.name || "Anonymous User"}
                      </h3>
                      {user.status === "verified" && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                          <Star className="h-3 w-3 fill-current" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground flex items-center justify-center gap-2 mt-2 text-sm">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="gap-2 px-3 py-1 text-sm font-medium shadow-md"
                    >
                      <Shield className="h-3 w-3" />
                      {user.role === "admin" ? "Administrator" : "User"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="gap-2 px-3 py-1 text-sm font-medium border-2 shadow-sm"
                    >
                      <Zap className="h-3 w-3" />
                      {user.provider === "github" ? "GitHub" : user.provider}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="gap-2 px-3 py-1 text-sm font-medium border-2 shadow-sm"
                    >
                      <Clock className="h-3 w-3" />
                      New Member
                    </Badge>
                  </div>
                </div>

                {/* Mobile: Action buttons */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Button asChild className="gap-2 justify-start h-11">
                      <Link href="/questions">
                        <MessageSquare />
                        Browse Questions
                      </Link>
                    </Button>
                    {user.role === "admin" && (
                      <Button
                        variant="secondary"
                        asChild
                        className="gap-2 justify-start h-11"
                      >
                        <Link href="/admin">
                          <Shield />
                          Admin Panel
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tablet & Desktop Layout - Side-by-side */}
              <div className="hidden sm:flex items-start gap-6">
                {/* Avatar Section */}
                <div className="shrink-0">
                  <div className="relative group">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse opacity-75 blur-sm"></div>
                      <div className="relative bg-linear-to-br from-background to-muted rounded-full p-1 shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                        <Avatar className="h-24 w-24 lg:h-28 lg:w-28 rounded-full border-4 border-background/50 backdrop-blur-sm shadow-inner">
                          <AvatarImage
                            src={user.avatar || ""}
                            alt={user.name || ""}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xl lg:text-2xl font-bold bg-linear-to-br from-primary via-purple-600 to-pink-600 text-white shadow-inner flex items-center justify-center">
                            {user.name?.charAt(0)?.toUpperCase() ||
                              user.email?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute bottom-1 right-1 flex items-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                          <div className="relative h-5 w-5 bg-green-500 rounded-full border-3 border-background shadow-lg">
                            <div className="absolute inset-1 bg-green-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* User Info Section */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="text-2xl lg:text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {user.name || "Anonymous User"}
                      </h3>
                      {user.status === "verified" && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                          <Star className="h-3 w-3 fill-current" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mt-2 text-base">
                      <Mail className="h-5 w-5" />
                      {user.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="gap-2 px-4 py-2 text-sm font-medium shadow-md"
                    >
                      <Shield />
                      {user.role === "admin" ? "Administrator" : "User"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="gap-2 px-4 py-2 text-sm font-medium border-2 shadow-sm"
                    >
                      <Zap />
                      {user.provider === "github" ? "GitHub" : user.provider}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="gap-2 px-4 py-2 text-sm font-medium border-2 shadow-sm"
                    >
                      <Clock />
                      New Member
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons Section */}
                <div className="hidden lg:flex flex-col gap-3 min-w-48 border-l pl-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Quick Actions
                  </div>
                  <Button asChild className="gap-2 justify-start h-11">
                    <Link href="/questions">
                      <MessageSquare />
                      Browse Questions
                    </Link>
                  </Button>
                  {user.role === "admin" && (
                    <Button
                      variant="secondary"
                      asChild
                      className="gap-2 justify-start h-11"
                    >
                      <Link href="/admin">
                        <Shield />
                        Admin Panel
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tablet-only action buttons (shown below user info) */}
              <div className="hidden sm:flex lg:hidden mt-6 pt-6 border-t">
                <div className="w-full">
                  <div className="text-sm font-medium text-muted-foreground mb-3">
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button asChild className="gap-2 justify-start h-11">
                      <Link href="/questions">
                        <MessageSquare />
                        Browse Questions
                      </Link>
                    </Button>
                    {user.role === "admin" && (
                      <Button
                        variant="secondary"
                        asChild
                        className="gap-2 justify-start h-11"
                      >
                        <Link href="/admin">
                          <Shield />
                          Admin Panel
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Questions Asked
                    </p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      0
                    </p>
                  </div>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Answers Given
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      0
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Best Answers
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      0
                    </p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Star className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      Today
                    </p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="border-b p-4 sm:p-6">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                Your Activity
              </CardTitle>
              <CardDescription>
                Track your engagement with the community
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  No activity yet
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto px-4">
                  Your activity statistics will appear here once you start
                  participating in the community by asking questions or
                  providing answers.
                </p>
                <Button className="mt-4 sm:mt-6" asChild>
                  <Link href="/questions">
                    Start Exploring
                    <TrendingUp />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
