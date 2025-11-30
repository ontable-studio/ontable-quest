"use server";

import { Redis } from "@upstash/redis";
import { QuestionValues } from "@/lib/validations/question";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { User, Question, LikeAction, UserRole, UserStatus, AdminStats } from "@/types/common";

const redis = new Redis({
  url: env.STORAGE_KV_REST_API_URL.toString(),
  token: env.STORAGE_KV_REST_API_TOKEN,
});

export async function submitQuestion(data: QuestionValues) {
  try {
    const id = Date.now().toString();
    const newQuestion: Question = {
      id,
      name: data.name || "Anonymous",
      category: data.category,
      question: data.question,
      createdAt: new Date().toISOString(),
      likes: [],
      dislikes: [],
      isDeleted: false,
      isVerified: false,
    };

    await redis.hset(`question:${id}`, newQuestion as unknown as Record<string, unknown>);

    // Broadcast to SSE clients
    try {
      const baseUrl = env.NEXTAUTH_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      await fetch(`${baseUrl}/api/questions/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newQuestion,
        }),
      });
    } catch (broadcastError) {
      // Don't fail the question submission if broadcast fails
      console.warn("Failed to broadcast to SSE clients:", broadcastError);
    }

    revalidatePath("/questions");

    return { success: true, id };
  } catch (error) {
    console.error("Failed to submit question:", error);
    throw new Error("Failed to submit question");
  }
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const keys = await redis.keys("question:*");
    const questions = await Promise.all(
      keys.map(async (key) => {
        try {
          const question = await redis.hgetall(key);
          if (!question) return null;

          // Parse likes and dislikes arrays if they exist, with error handling
          let likes = [];
          let dislikes = [];

          try {
            if (question.likes) {
              // Handle both arrays and JSON strings
              if (Array.isArray(question.likes)) {
                likes = question.likes;
              } else {
                likes = JSON.parse(question.likes as string);
              }
            }
          } catch (e) {
            console.warn("Failed to parse likes for question:", key, e);
            likes = [];
          }

          try {
            if (question.dislikes) {
              // Handle both arrays and JSON strings
              if (Array.isArray(question.dislikes)) {
                dislikes = question.dislikes;
              } else {
                dislikes = JSON.parse(question.dislikes as string);
              }
            }
          } catch (e) {
            console.warn("Failed to parse dislikes for question:", key, e);
            dislikes = [];
          }

          const parsedQuestion = {
            ...question,
            likes,
            dislikes,
            isDeleted: question.isDeleted === 'true' || question.isDeleted === true,
            isVerified: question.isVerified === 'true' || question.isVerified === true,
          } as Question;

          return parsedQuestion;
        } catch (error) {
          console.error("Failed to process question:", key, error);
          return null;
        }
      })
    );

    // Filter out null questions and sort by creation date (newest first)
    const validQuestions = questions.filter((q): q is Question => q !== null);

    return validQuestions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return [];
  }
}

// User management functions
export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = Date.now().toString();
    const newUser: User = {
      id,
      email: userData.email,
      name: userData.name || undefined,
      role: userData.role || 'user',
      status: userData.status || 'unverified',
      avatar: userData.avatar || undefined,
      provider: userData.provider || 'credentials',
      providerAccountId: userData.providerAccountId,
      passwordHash: userData.passwordHash,
      emailVerified: userData.emailVerified || undefined,
      verificationToken: userData.verificationToken,
      resetPasswordToken: userData.resetPasswordToken,
      resetPasswordExpires: userData.resetPasswordExpires,
      lastLoginAt: userData.lastLoginAt,
      createdAt: new Date().toISOString(),
    };

    await redis.hset(`user:${id}`, newUser as unknown as Record<string, unknown>);

    // Also create email to ID mapping for easy lookup
    await redis.set(`user_email:${userData.email}`, id);

    revalidatePath("/admin");
    return { success: true, id };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const userId = await redis.get(`user_email:${email}`);
    if (!userId) return null;

    const user = await redis.hgetall(`user:${userId}`);
    return user as User | null;
  } catch (error) {
    console.error("Failed to get user by email:", error);
    return null;
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
  try {
    const existingUser = await redis.hgetall(`user:${userId}`);
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    await redis.hset(`user:${userId}`, { ...existingUser, role });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const existingUser = await redis.hgetall(`user:${userId}`);
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    await redis.hset(`user:${userId}`, { ...existingUser, status });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user status:", error);
    return { success: false, error: "Failed to update user status" };
  }
}

export async function updateUserProfile(userId: string, updateData: { name?: string; avatar?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const existingUser = await redis.hgetall(`user:${userId}`);
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Only update the fields that are provided
    const updatedUser = { ...existingUser };
    if (updateData.name !== undefined) updatedUser.name = updateData.name;
    if (updateData.avatar !== undefined) updatedUser.avatar = updateData.avatar;

    await redis.hset(`user:${userId}`, updatedUser);

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return { success: false, error: "Failed to update user profile" };
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const keys = await redis.keys("user:*");
    const users = await Promise.all(
      keys.map(async (key) => {
        const user = await redis.hgetall(key);
        return user as User | null;
      })
    );

    const validUsers = users.filter((u): u is User => u !== null);
    return validUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

// Like/Dislike functions
export async function toggleLike(questionId: string, userId: string, action: LikeAction): Promise<{ success: boolean; error?: string }> {
  try {
    const question = await redis.hgetall(`question:${questionId}`);
    if (!question) {
      return { success: false, error: "Question not found" };
    }

    const currentQuestion = question as unknown as Question;
    let likes = [...(currentQuestion.likes || [])];
    let dislikes = [...(currentQuestion.dislikes || [])];

    // Remove user from both arrays first
    likes = likes.filter(id => id !== userId);
    dislikes = dislikes.filter(id => id !== userId);

    // Add user to appropriate array based on action
    if (action === 'like') {
      likes.push(userId);
    } else if (action === 'dislike') {
      dislikes.push(userId);
    }

    await redis.hset(`question:${questionId}`, {
      ...currentQuestion,
      likes: JSON.stringify(likes),
      dislikes: JSON.stringify(dislikes)
    });

    revalidatePath("/questions");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

// Admin functions for content management
export async function deleteQuestion(questionId: string, adminUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const question = await redis.hgetall(`question:${questionId}`);
    if (!question) {
      return { success: false, error: "Question not found" };
    }

    const updatedQuestion = {
      ...question,
      isDeleted: true,
      deletedBy: adminUserId,
      deletedAt: new Date().toISOString(),
    };

    await redis.hset(`question:${questionId}`, updatedQuestion);

    revalidatePath("/admin");
    revalidatePath("/questions");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { success: false, error: "Failed to delete question" };
  }
}

export async function verifyQuestion(questionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const question = await redis.hgetall(`question:${questionId}`);
    if (!question) {
      return { success: false, error: "Question not found" };
    }

    await redis.hset(`question:${questionId}`, { ...question, isVerified: true });

    revalidatePath("/admin");
    revalidatePath("/questions");
    return { success: true };
  } catch (error) {
    console.error("Failed to verify question:", error);
    return { success: false, error: "Failed to verify question" };
  }
}

export async function unverifyQuestion(questionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const question = await redis.hgetall(`question:${questionId}`);
    if (!question) {
      return { success: false, error: "Question not found" };
    }

    await redis.hset(`question:${questionId}`, { ...question, isVerified: false });

    revalidatePath("/admin");
    revalidatePath("/questions");
    return { success: true };
  } catch (error) {
    console.error("Failed to unverify question:", error);
    return { success: false, error: "Failed to unverify question" };
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const questions = await getQuestions();
    const users = await getAllUsers();

    const totalLikes = questions.reduce((sum, q) => sum + (q.likes?.length || 0), 0);
    const totalDislikes = questions.reduce((sum, q) => sum + (q.dislikes?.length || 0), 0);
    const deletedQuestions = questions.filter(q => q.isDeleted).length;
    const verifiedUsers = users.filter(u => u.status === 'verified').length;
    const unverifiedUsers = users.filter(u => u.status === 'unverified').length;

    return {
      totalQuestions: questions.length,
      verifiedUsers,
      unverifiedUsers,
      totalLikes,
      totalDislikes,
      deletedQuestions,
    };
  } catch (error) {
    console.error("Failed to get admin stats:", error);
    return {
      totalQuestions: 0,
      verifiedUsers: 0,
      unverifiedUsers: 0,
      totalLikes: 0,
      totalDislikes: 0,
      deletedQuestions: 0,
    };
  }
}

// Updated getQuestions to handle new fields and filter deleted questions
export async function getActiveQuestions(): Promise<Question[]> {
  try {
    const allQuestions = await getQuestions();
    return allQuestions.filter(q => !q.isDeleted);
  } catch (error) {
    console.error("Failed to get active questions:", error);
    return [];
  }
}

export async function getDeletedQuestions(): Promise<Question[]> {
  try {
    const allQuestions = await getQuestions();
    return allQuestions.filter(q => q.isDeleted);
  } catch (error) {
    console.error("Failed to get deleted questions:", error);
    return [];
  }
}
