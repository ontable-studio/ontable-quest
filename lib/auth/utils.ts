import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";
import { User } from "@/types/common";

const redis = new Redis({
  url: env.STORAGE_KV_REST_API_URL.toString(),
  token: env.STORAGE_KV_REST_API_TOKEN,
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUserWithPassword(email: string, name: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const id = Date.now().toString();
    const newUser: User = {
      id,
      email,
      name,
      role: 'user',
      status: 'unverified',
      provider: 'credentials',
      passwordHash,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    await redis.hset(`user:${id}`, newUser as unknown as Record<string, unknown>);
    await redis.set(`user_email:${email}`, id);

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid credentials" };
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid credentials" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error authenticating user:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function generatePasswordResetToken(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return { success: true };
    }

    const token = generateRandomToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await redis.hset(`user:${user.id}`, {
      ...user,
      resetPasswordToken: token,
      resetPasswordExpires: expires.toISOString(),
    });

    return { success: true, token };
  } catch (error) {
    console.error("Error generating password reset token:", error);
    return { success: false, error: "Failed to generate reset token" };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find user with this token
    const keys = await redis.keys("user:*");
    let user: User | null = null;
    let userKey = "";

    for (const key of keys) {
      const userData = await redis.hgetall(key);
      if (userData && userData.resetPasswordToken === token) {
        user = userData as unknown as User;
        userKey = key;
        break;
      }
    }

    if (!user) {
      return { success: false, error: "Invalid or expired token" };
    }

    // Check if token is expired
    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return { success: false, error: "Token has expired" };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password and clear reset token
    await redis.hset(userKey, {
      ...user,
      passwordHash,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find user with verification token
    const keys = await redis.keys("user:*");
    let user: User | null = null;
    let userKey = "";

    for (const key of keys) {
      const userData = await redis.hgetall(key);
      if (userData && userData.verificationToken === token) {
        user = userData as unknown as User;
        userKey = key;
        break;
      }
    }

    if (!user) {
      return { success: false, error: "Invalid verification token" };
    }

    // Update user as verified
    await redis.hset(userKey, {
      ...user,
      emailVerified: true,
      status: 'verified',
      verificationToken: undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Error verifying email:", error);
    return { success: false, error: "Failed to verify email" };
  }
}

async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const userId = await redis.get(`user_email:${email}`);
    if (!userId) return null;

    const user = await redis.hgetall(`user:${userId}`);
    return user as User | null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}