"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  MessageSquare,
  Heart,
  TrendingUp,
  Zap,
  Clock,
  Star,
  Settings,
  Loader2,
  Activity,
} from "lucide-react";


export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 font-sans overflow-x-hidden">
      <div className="container mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8 relative z-10">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="space-y-2">
                <Skeleton className="h-10 w-[250px] sm:h-12 sm:w-[300px] lg:h-14 lg:w-[400px]" />
                <Skeleton className="h-5 w-[300px] sm:h-6 sm:w-[400px]" />
              </div>
            </div>
            <Skeleton className="h-9 w-32 sm:h-10 sm:w-36" />
          </div>

          {/* User Profile Card Skeleton */}
          <Card className="border-0 shadow-lg bg-linear-to-r from-card to-card/80 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-8 w-32" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="hidden sm:flex items-start gap-6">
                {/* Avatar Skeleton */}
                <div className="shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse opacity-75 blur-sm"></div>
                    <div className="relative bg-linear-to-br from-background to-muted rounded-full p-1 shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                      <div className="h-24 w-24 lg:h-28 lg:w-28 rounded-full border-4 border-background/50 backdrop-blur-sm shadow-inner bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-1">
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                        <div className="relative h-5 w-5 bg-green-500 rounded-full border-3 border-background shadow-lg">
                          <div className="absolute inset-1 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Info Skeleton */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <Skeleton className="h-8 w-48 lg:h-9 lg:w-64" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-7 w-32 rounded-md" />
                    <Skeleton className="h-7 w-24 rounded-md border-2" />
                    <Skeleton className="h-7 w-28 rounded-md border-2" />
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="hidden lg:flex flex-col gap-3 min-w-48 border-l pl-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>

              {/* Mobile-only skeleton */}
              <div className="sm:hidden space-y-4">
                <Skeleton className="h-20 w-20 mx-auto rounded-full" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
                <div className="flex justify-center gap-2">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md border-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats Skeleton */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Questions Asked Card */}
            <Card className="border-0 shadow-md bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Answers Given Card */}
            <Card className="border-0 shadow-md bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Answers Card */}
            <Card className="border-0 shadow-md bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Star className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Since Card */}
            <Card className="border-0 shadow-md bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section Skeleton */}
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="border-b p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground animate-pulse" />
                </div>
                <Skeleton className="h-6 w-40 mx-auto mb-2" />
                <Skeleton className="h-4 w-64 mx-auto mb-6" />
                <Skeleton className="h-10 w-32 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loading indicator overlay */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Loading Dashboard...</span>
        </div>
      </div>
    </div>
  );
}