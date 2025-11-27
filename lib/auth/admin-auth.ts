import { NextRequest } from "next/server";
import { auth } from "./auth";
import { AuthUser } from "@/types/common";
import { ApiResponse } from "@/types/common";

/**
 * Get the current authenticated user from the session
 */
export async function getCurrentUser(request?: NextRequest): Promise<AuthUser | null> {
  try {
    const session = await auth();

    if (!session?.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(request?: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user !== null;
}

/**
 * Check if the current user has admin role
 */
export async function isAdmin(request?: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.role === 'admin';
}

/**
 * Require admin authentication for API routes
 * Returns the authenticated user if admin, null otherwise
 */
export async function requireAdmin(request?: NextRequest): Promise<{ user: AuthUser } | null> {
  const user = await getCurrentUser(request);

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    return null;
  }

  return { user };
}

/**
 * Create a standardized 403 Forbidden response for admin routes
 */
export function createAdminForbiddenResponse(message: string = "Admin access required"): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      status: 403,
    },
  };

  return new Response(JSON.stringify(response), {
    status: 403,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create a standardized 401 Unauthorized response
 */
export function createUnauthorizedResponse(message: string = "Authentication required"): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      status: 401,
    },
  };

  return new Response(JSON.stringify(response), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
    },
  });
}