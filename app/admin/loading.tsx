"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  MessageSquare,
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";

// Static background effects component
const BackgroundEffects = () => (
  <>
    <div
      className="absolute inset-0 bg-linear-to-r from-primary/2 via-primary/4 to-primary/2"
      style={{
        filter: "blur(40px)",
        zIndex: 0,
      }}
    />
    <div
      className="absolute inset-0 bg-linear-to-l from-secondary/2 via-secondary/4 to-secondary/2"
      style={{
        filter: "blur(60px)",
        zIndex: 0,
      }}
    />
  </>
);

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      <BackgroundEffects />
      <main className="container mx-auto py-8 px-4 relative z-10">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative">
            <section className="text-center space-y-4 relative z-20">
              <div className="space-y-6">
                <div>
                  <Badge variant="secondary" className="inline-flex">
                    <Settings className="" />
                    Admin Control Panel
                  </Badge>
                </div>

                <div className="relative py-12">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-linear-to-r from-primary/3 via-primary/6 to-primary/3 rounded-2xl blur-2xl -z-10" />

                  {/* Main Heading Skeleton */}
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-[300px] mx-auto" />
                    <Skeleton className="h-6 w-[500px] mx-auto" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Badge variant="outline" className="animate-pulse">
                  <RefreshCw className=" animate-spin" />
                  Loading Admin Data...
                </Badge>
              </div>
            </section>
          </div>

          {/* Stats Cards Skeleton */}
          <section className="mt-12 pt-8 border-t">
            <div className="text-center space-y-4 mb-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Questions */}
              <div>
                <Card className="text-center hover:border-primary/20 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-primary">
                        <MessageSquare className="h-8 w-8" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Verified Users */}
              <div>
                <Card className="text-center hover:border-primary/20 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-primary">
                        <Users className="h-8 w-8" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Verifications */}
              <div>
                <Card className="text-center hover:border-primary/20 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-primary">
                        <Activity className="h-8 w-8" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Total Engagement */}
              <div>
                <Card className="text-center hover:border-primary/20 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-primary">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Management Section Skeleton */}
          <section className="mt-12 pt-8 border-t">
            <div className="text-center space-y-4">
              <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />

              {/* Tab Navigation Skeleton */}
              <div className="flex justify-center gap-4 mt-8">
                <Skeleton className="h-10 w-40 rounded-lg" />
                <Skeleton className="h-10 w-44 rounded-lg" />
              </div>
            </div>

            {/* Management Content Skeleton */}
            <div className="max-w-4xl mx-auto space-y-4 pt-8">
              {/* Questions Tab Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="flex flex-col flex-1 min-h-0 px-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground shrink-0 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>

                  {/* Questions List Skeleton - Matching actual structure */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="space-y-4">
                      {[...Array(6)].map((_, i) => (
                        <Card
                          key={i}
                          className="gap-4 hover:shadow-sm transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-20 text-xs" />{" "}
                                {/* Category Badge */}
                                <Skeleton className="h-3 w-4 text-muted-foreground" />{" "}
                                {/* User icon */}
                                <Skeleton className="h-3 w-16 text-muted-foreground" />{" "}
                                {/* User name */}
                              </div>
                              <div className="flex items-center gap-1">
                                <Skeleton className="h-3 w-3 text-muted-foreground" />{" "}
                                {/* Calendar icon */}
                                <Skeleton className="h-3 w-16 text-muted-foreground" />{" "}
                                {/* Date */}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-4 w-full leading-relaxed" />{" "}
                            {/* Question text */}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Tab Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <Skeleton className="h-6 w-36" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Skeleton className="h-5 w-32" />{" "}
                              {/* User name */}
                              <Skeleton className="h-5 w-16" />{" "}
                              {/* Role badge */}
                              <Skeleton className="h-5 w-20" />{" "}
                              {/* Status badge */}
                            </div>
                            <Skeleton className="h-4 w-48" /> {/* Email */}
                            <Skeleton className="h-3 w-32" />{" "}
                            {/* Joined date */}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Skeleton className="h-8 w-8" />{" "}
                            {/* Action button 1 */}
                            <Skeleton className="h-8 w-8" />{" "}
                            {/* Action button 2 */}
                            <Skeleton className="h-8 w-8" />{" "}
                            {/* Action button 3 */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Loading indicator overlay */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Loading Admin Panel...</span>
        </div>
      </div>
    </div>
  );
}
