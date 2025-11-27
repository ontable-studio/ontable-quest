// Base entities that can be reused across the app
export interface BaseEntity {
  id: string;
  createdAt: string;
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    status?: number;
  };
  success: boolean;
}

// User roles and status
export type UserRole = 'user' | 'admin';
export type UserStatus = 'unverified' | 'verified';
export type AuthProvider = 'credentials' | 'github' | 'email';

// User entity
export interface User extends BaseEntity {
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  // Auth-specific fields
  provider: AuthProvider;
  providerAccountId?: string; // For GitHub OAuth
  passwordHash?: string; // For credentials auth only
  emailVerified?: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  lastLoginAt?: string;
}

// NextAuth.js session type
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  provider: AuthProvider;
}

// Common user content shape
export interface UserContent extends BaseEntity {
  name?: string;
  category?: string;
  userId?: string;
  isVerified?: boolean;
}

// Question type - extends common shapes
export type Question = UserContent & {
  question: string;
  likes: string[]; // Array of user IDs who liked
  dislikes: string[]; // Array of user IDs who disliked
  isDeleted: boolean;
  deletedBy?: string; // Admin user ID who deleted it
  deletedAt?: string;
  isVerified: boolean;
};

// Like/Dislike action type
export type LikeAction = 'like' | 'dislike' | 'remove';

// Generic loading state
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic async operation result
export interface AsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Admin actions
export interface AdminStats {
  totalQuestions: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalLikes: number;
  totalDislikes: number;
  deletedQuestions: number;
}

// Session context type
export interface SessionContext {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
}