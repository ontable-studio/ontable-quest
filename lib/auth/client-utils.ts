import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    isAdmin: session?.user?.role === "admin",
    isVerified: session?.user?.status === "verified",
  };
}

export function requireAuth(callback?: () => void) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return false; // Still loading
  }

  if (!isAuthenticated) {
    if (callback) callback();
    return false;
  }

  return true;
}

export function requireAdmin(callback?: () => void) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return false; // Still loading
  }

  if (!isAuthenticated || !isAdmin) {
    if (callback) callback();
    return false;
  }

  return true;
}

// Server-side auth check helper
export async function getServerSession() {
  const { auth } = await import("./auth");
  return await auth();
}