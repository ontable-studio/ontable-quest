"use client";

import { useState, useEffect, useCallback, Suspense } from "react";

// Prevent static generation
export const dynamic = 'force-dynamic';
import { AdminStats, User, Question } from "@/types/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  CheckCircle,
  Users,
  MessageSquare,
  ThumbsDown,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  Settings,
  BarChart3,
  Activity,
  TrendingUp,
  Search,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";

// Categories for filtering
const CATEGORIES = [
  "Programming",
  "Design",
  "Marketing",
  "3D",
  "Unity",
  "Project Management",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Business",
  "Other",
];

// Filter interfaces
interface QuestionFilters {
  search: string;
  category: string;
  status: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<"questions" | "users">(
    "questions",
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [questionFilters, setQuestionFilters] = useState<QuestionFilters>({
    search: "",
    category: "",
    status: "",
  });
  const [userFilters, setUserFilters] = useState<UserFilters>({
    search: "",
    role: "",
    status: "",
  });
  const [showQuestionFilters, setShowQuestionFilters] = useState(false);
  const [showUserFilters, setShowUserFilters] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [statsRes, usersRes, questionsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
          fetch("/api/questions"),
        ]);

        if (statsRes.ok) {
          const statsResponse = await statsRes.json();
          setStats(statsResponse.data || statsResponse);
        }

        if (usersRes.ok) {
          const usersResponse = await usersRes.json();
          setUsers(usersResponse.data || usersResponse);
        }

        if (questionsRes.ok) {
          const questionsResponse = await questionsRes.json();
          // Handle the different response formats
          if (questionsResponse.data?.questions) {
            setQuestions(questionsResponse.data.questions);
          } else if (questionsResponse.questions) {
            setQuestions(questionsResponse.questions);
          } else {
            setQuestions(questionsResponse.data || questionsResponse);
          }
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin data");
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchData();
  }, []);

  // Handle user status updates
  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`User ${newStatus} successfully`);
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, status: newStatus as User["status"] }
              : user,
          ),
        );
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  // Handle user role updates
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, role: newRole as User["role"] }
              : user,
          ),
        );
      } else {
        toast.error("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Question deleted successfully");
        setQuestions(questions.filter((q) => q.id !== questionId));
      } else {
        toast.error("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Handle question verification/unverification
  const handleUpdateQuestionStatus = async (
    questionId: string,
    isVerified: boolean,
  ) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified }),
      });

      if (response.ok) {
        toast.success(
          `Question ${isVerified ? "verified" : "unverified"} successfully`,
        );
        setQuestions(
          questions.map((q) =>
            q.id === questionId ? { ...q, isVerified } : q,
          ),
        );
      } else {
        toast.error("Failed to update question status");
      }
    } catch (error) {
      console.error("Error updating question status:", error);
      toast.error("Failed to update question status");
    }
  };

  // Filter functions
  const handleQuestionSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const timeoutId = setTimeout(() => {
        setQuestionFilters((prev) => ({ ...prev, search: value }));
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [setQuestionFilters],
  );

  const handleUserSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const timeoutId = setTimeout(() => {
        setUserFilters((prev) => ({ ...prev, search: value }));
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [setUserFilters],
  );

  const clearQuestionFilters = () => {
    setQuestionFilters({ search: "", category: "", status: "" });
    setShowQuestionFilters(false);
  };

  const clearUserFilters = () => {
    setUserFilters({ search: "", role: "", status: "" });
    setShowUserFilters(false);
  };

  // Filter questions
  const getFilteredQuestions = () => {
    let filtered = questions;

    if (questionFilters.search) {
      const searchLower = questionFilters.search.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(searchLower) ||
          q.name?.toLowerCase().includes(searchLower) ||
          q.category?.toLowerCase().includes(searchLower),
      );
    }

    if (questionFilters.category) {
      filtered = filtered.filter(
        (q) => q.category === questionFilters.category,
      );
    }

    if (questionFilters.status) {
      if (questionFilters.status === "verified") {
        filtered = filtered.filter((q) => q.isVerified);
      } else if (questionFilters.status === "pending") {
        filtered = filtered.filter((q) => !q.isVerified);
      } else if (questionFilters.status === "deleted") {
        filtered = filtered.filter((q) => q.isDeleted);
      }
    }

    return filtered;
  };

  // Filter users
  const getFilteredUsers = () => {
    let filtered = users;

    if (userFilters.search) {
      const searchLower = userFilters.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower),
      );
    }

    if (userFilters.role) {
      filtered = filtered.filter((u) => u.role === userFilters.role);
    }

    if (userFilters.status) {
      filtered = filtered.filter((u) => u.status === userFilters.status);
    }

    return filtered;
  };

  return (
    <Suspense>
      <div className="min-h-screen bg-background font-sans overflow-hidden">
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
                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center text-foreground relative z-20">
                      Admin Dashboard
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground text-lg mt-4">
                      Manage your community efficiently. Monitor questions,
                      users, and platform statistics in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Badge variant="outline" className="animate-pulse">
                    <RefreshCw className=" animate-spin" />
                    Live Dashboard
                  </Badge>
                </div>
              </section>
            </div>

            {/* Stats Cards Section */}
            <section className="mt-12 pt-8 border-t">
              <div className="text-center space-y-4 mb-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Platform Statistics</h2>
                <p className="text-muted-foreground">
                  Monitor key metrics and performance indicators
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Questions */}
                <div className="hover:transform hover:-translate-y-1 transition-transform">
                  <Card className="text-center hover:border-primary/20 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-primary">
                          <MessageSquare className="h-8 w-8" />
                        </div>
                        <div className="text-2xl font-bold">
                          {stats ? stats.totalQuestions : "0"}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total Questions
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Verified Users */}
                <div className="hover:transform hover:-translate-y-1 transition-transform">
                  <Card className="text-center hover:border-primary/20 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-primary">
                          <Users className="h-8 w-8" />
                        </div>
                        <div className="text-2xl font-bold">
                          {stats ? stats.verifiedUsers : "0"}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Verified Users
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pending Verifications */}
                <div className="hover:transform hover:-translate-y-1 transition-transform">
                  <Card className="text-center hover:border-primary/20 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-primary">
                          <Activity className="h-8 w-8" />
                        </div>
                        <div className="text-2xl font-bold">
                          {stats ? stats.unverifiedUsers : "0"}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pending Verifications
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Admin Actions */}
                <div className="hover:transform hover:-translate-y-1 transition-transform">
                  <Card className="text-center hover:border-primary/20 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-primary">
                          <TrendingUp className="h-8 w-8" />
                        </div>
                        <div className="text-2xl font-bold">
                          {stats ? stats.totalLikes + stats.totalDislikes : "0"}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total Engagement
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Management Section */}
            <section className="mt-12 pt-8 border-t">
              <div className="text-center space-y-4">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Content Management</h2>
                <p className="text-muted-foreground">
                  Manage questions and users efficiently
                </p>

                {/* Tab Navigation */}
                <div className="flex justify-center gap-4 my-8">
                  <Button
                    variant={activeTab === "questions" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("questions")}
                    className="gap-2"
                  >
                    <MessageSquare />
                    Questions Management
                  </Button>
                  <Button
                    variant={activeTab === "users" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("users")}
                    className="gap-2"
                  >
                    <Users />
                    Users Management
                  </Button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "questions" && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search questions, names, or categories..."
                              onChange={handleQuestionSearchChange}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* Filter buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setShowQuestionFilters(!showQuestionFilters)
                            }
                            className="gap-2"
                          >
                            <Filter />
                            Filters
                            {(questionFilters.category ||
                              questionFilters.status) && (
                              <Badge variant="secondary" className="ml-1">
                                Active
                              </Badge>
                            )}
                          </Button>

                          {(questionFilters.search ||
                            questionFilters.category ||
                            questionFilters.status) && (
                            <Button
                              variant="ghost"
                              onClick={clearQuestionFilters}
                              className="gap-2"
                            >
                              <X />
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Filter options */}
                      {showQuestionFilters && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Categories
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={
                                  questionFilters.category === ""
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setQuestionFilters((prev) => ({
                                    ...prev,
                                    category: "",
                                  }))
                                }
                                className="text-xs"
                              >
                                All
                              </Button>
                              {CATEGORIES.map((category) => (
                                <Button
                                  key={category}
                                  variant={
                                    questionFilters.category === category
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    setQuestionFilters((prev) => ({
                                      ...prev,
                                      category,
                                    }))
                                  }
                                  className="text-xs"
                                >
                                  {category}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Status</h4>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={
                                  questionFilters.status === ""
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setQuestionFilters((prev) => ({
                                    ...prev,
                                    status: "",
                                  }))
                                }
                                className="text-xs"
                              >
                                All
                              </Button>
                              <Button
                                variant={
                                  questionFilters.status === "verified"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setQuestionFilters((prev) => ({
                                    ...prev,
                                    status: "verified",
                                  }))
                                }
                                className="text-xs"
                              >
                                Verified
                              </Button>
                              <Button
                                variant={
                                  questionFilters.status === "pending"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setQuestionFilters((prev) => ({
                                    ...prev,
                                    status: "pending",
                                  }))
                                }
                                className="text-xs"
                              >
                                Pending
                              </Button>
                              <Button
                                variant={
                                  questionFilters.status === "deleted"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setQuestionFilters((prev) => ({
                                    ...prev,
                                    status: "deleted",
                                  }))
                                }
                                className="text-xs"
                              >
                                Deleted
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Questions ({getFilteredQuestions().length})
                        </span>
                        <Badge variant="outline" className="animate-pulse">
                          Live
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Review and moderate community questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 min-h-0 px-6">
                      <div className="flex items-center justify-between text-sm text-muted-foreground shrink-0 mb-4">
                        <span>
                          Showing {getFilteredQuestions().length} of{" "}
                          {questions.length} Questions
                        </span>
                        <span className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-muted rounded-full" />
                          {questionFilters.search ||
                          questionFilters.category ||
                          questionFilters.status
                            ? "Filtered"
                            : "All"}
                        </span>
                      </div>

                      <div className="flex-1 min-h-0 overflow-hidden">
                        {isInitialLoad ? (
                          // Show skeleton loading during initial load
                          <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className="border rounded-lg p-4 hover:border-primary/20 transition-colors mb-4"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Skeleton className="h-5 w-20" />{" "}
                                      {/* Category badge */}
                                      <Skeleton className="h-5 w-16" />{" "}
                                      {/* Status badge */}
                                    </div>
                                    <Skeleton className="h-5 w-4/5 mb-2" />{" "}
                                    {/* Question title */}
                                    <Skeleton className="h-4 w-full mb-2" />{" "}
                                    {/* Question text */}
                                    <div className="flex items-center gap-4">
                                      <Skeleton className="h-3 w-16" />{" "}
                                      {/* Likes */}
                                      <Skeleton className="h-3 w-20" />{" "}
                                      {/* Dislikes */}
                                      <Skeleton className="h-3 w-20" />{" "}
                                      {/* Date */}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <Skeleton className="h-8 w-8" />{" "}
                                    {/* Action button 1 */}
                                    <Skeleton className="h-8 w-8" />{" "}
                                    {/* Action button 2 */}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : getFilteredQuestions().length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            {questions.length === 0
                              ? "No questions found"
                              : "No questions match your filters"}
                          </div>
                        ) : (
                          Array.isArray(getFilteredQuestions()) &&
                          getFilteredQuestions().map((question) => (
                            <div
                              key={question.id}
                              className="border rounded-lg p-4 hover:border-primary/20 transition-colors mb-4"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary">
                                      {question.category || "General"}
                                    </Badge>
                                    <Badge
                                      variant={
                                        question.isVerified
                                          ? "default"
                                          : "outline"
                                      }
                                    >
                                      {question.isVerified
                                        ? "Verified"
                                        : "Pending"}
                                    </Badge>
                                  </div>
                                  <h3 className="font-medium mb-2">
                                    {question.name || "Untitled Question"}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {question.question}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Likes: {question.likes.length}</span>
                                    <span>
                                      Dislikes: {question.dislikes.length}
                                    </span>
                                    <span>
                                      {new Date(
                                        question.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {!question.isVerified && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleUpdateQuestionStatus(
                                          question.id,
                                          true,
                                        )
                                      }
                                    >
                                      <CheckCircle />
                                    </Button>
                                  )}
                                  {question.isVerified && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleUpdateQuestionStatus(
                                          question.id,
                                          false,
                                        )
                                      }
                                    >
                                      <ThumbsDown />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDeleteQuestion(question.id)
                                    }
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search users by name or email..."
                              onChange={handleUserSearchChange}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* Filter buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowUserFilters(!showUserFilters)}
                            className="gap-2"
                          >
                            <Filter />
                            Filters
                            {(userFilters.role || userFilters.status) && (
                              <Badge variant="secondary" className="ml-1">
                                Active
                              </Badge>
                            )}
                          </Button>

                          {(userFilters.search ||
                            userFilters.role ||
                            userFilters.status) && (
                            <Button
                              variant="ghost"
                              onClick={clearUserFilters}
                              className="gap-2"
                            >
                              <X />
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Filter options */}
                      {showUserFilters && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Role</h4>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={
                                  userFilters.role === ""
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setUserFilters((prev) => ({
                                    ...prev,
                                    role: "",
                                  }))
                                }
                                className="text-xs"
                              >
                                All
                              </Button>
                              <Button
                                variant={
                                  userFilters.role === "user"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setUserFilters((prev) => ({
                                    ...prev,
                                    role: "user",
                                  }))
                                }
                                className="text-xs"
                              >
                                User
                              </Button>
                              <Button
                                variant={
                                  userFilters.role === "admin"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setUserFilters((prev) => ({
                                    ...prev,
                                    role: "admin",
                                  }))
                                }
                                className="text-xs"
                              >
                                Admin
                              </Button>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Status</h4>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={
                                  userFilters.status === ""
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setUserFilters((prev) => ({
                                    ...prev,
                                    status: "",
                                  }))
                                }
                                className="text-xs"
                              >
                                All
                              </Button>
                              <Button
                                variant={
                                  userFilters.status === "verified"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setUserFilters((prev) => ({
                                    ...prev,
                                    status: "verified",
                                  }))
                                }
                                className="text-xs"
                              >
                                Verified
                              </Button>
                              <Button
                                variant={
                                  userFilters.status === "unverified"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setUserFilters((prev) => ({
                                    ...prev,
                                    status: "unverified",
                                  }))
                                }
                                className="text-xs"
                              >
                                Unverified
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Users ({getFilteredUsers().length})
                      </CardTitle>
                      <CardDescription>
                        Manage user accounts, roles, and verification status.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isInitialLoad ? (
                        // Show skeleton loading during initial load
                        <div className="space-y-4">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="border rounded-lg p-4 hover:border-primary/20 transition-colors mb-4"
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
                                  <Skeleton className="h-4 w-48" />{" "}
                                  {/* Email */}
                                  <Skeleton className="h-3 w-32" />{" "}
                                  {/* Joined date */}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Skeleton className="h-8 w-8" />{" "}
                                  {/* Action button 1 */}
                                  <Skeleton className="h-8 w-8" />{" "}
                                  {/* Action button 2 */}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : getFilteredUsers().length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          {users.length === 0
                            ? "No users found"
                            : "No users match your filters"}
                        </div>
                      ) : (
                        Array.isArray(getFilteredUsers()) &&
                        getFilteredUsers().map((user) => (
                          <div
                            key={user.id}
                            className="border rounded-lg p-4 hover:border-primary/20 transition-colors mb-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">
                                    {user.name || user.email}
                                  </h3>
                                  <Badge
                                    variant={
                                      user.role === "admin"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {user.role}
                                  </Badge>
                                  <Badge
                                    variant={
                                      user.status === "verified"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {user.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Joined{" "}
                                  {new Date(
                                    user.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                {user.status === "unverified" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateUserStatus(
                                        user.id,
                                        "verified",
                                      )
                                    }
                                  >
                                    <UserCheck />
                                  </Button>
                                )}
                                {user.status === "verified" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateUserStatus(
                                        user.id,
                                        "unverified",
                                      )
                                    }
                                  >
                                    <UserX />
                                  </Button>
                                )}
                                {user.role === "user" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateUserRole(user.id, "admin")
                                    }
                                  >
                                    <Shield />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </Suspense>
  );
}
