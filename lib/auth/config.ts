import { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UpstashAdapter } from "./adapter";
import { env } from "@/lib/env";
import { Redis } from "@upstash/redis";
import { User, AuthProvider } from "@/types/common";

const redis = new Redis({
  url: env.STORAGE_KV_REST_API_URL.toString(),
  token: env.STORAGE_KV_REST_API_TOKEN,
});

export const authConfig: NextAuthConfig = {
  adapter: UpstashAdapter(),
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getUserByEmail(credentials.email as string);
          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user && account) {
        // Update user's provider and last login
        const provider = account.provider as AuthProvider;
        await updateUserProvider(user.id || '', provider, account.providerAccountId || '');

        // For GitHub users, set email as verified
        if (provider === 'github') {
          await updateEmailVerification(user.id || '', true);
        }

        // Get full user data from database
        const userData = await getUserById(user.id || '');

        token.user = {
          id: user.id || '',
          email: user.email || '',
          name: user.name || undefined,
          avatar: user.image || undefined,
          role: userData?.role || 'user',
          status: userData?.status || 'unverified',
          provider: provider,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        const user = token.user as any;
        session.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          emailVerified: null,
          role: user.role,
          status: user.status,
          provider: user.provider,
        };
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        console.log("SignIn callback - Provider:", account?.provider, "Email:", user.email);

        // Check if user exists
        const existingUser = await getUserByEmail(user.email);
        console.log("Existing user:", existingUser ? existingUser.id : "Not found");

        if (!existingUser && account?.provider === 'github') {
          // Auto-verify GitHub users - create new user
          console.log("Creating new GitHub user");
          await createGitHubUser(user, account);
        } else if (existingUser && account?.provider === 'github') {
          // Check if GitHub account is already linked
          const accountKey = `account:github:${account.providerAccountId}`;
          const linkedUserId = await redis.get(accountKey);
          console.log("Account key:", accountKey, "Linked user ID:", linkedUserId);

          if (!linkedUserId) {
            // GitHub account not linked - link it to existing user
            console.log("Linking GitHub account to existing user:", existingUser.id);
            await redis.set(accountKey, existingUser.id);

            // Update user with GitHub info
            await redis.hset(`user:${existingUser.id}`, {
              ...existingUser,
              provider: 'github',
              providerAccountId: account.providerAccountId,
              avatar: user.image || existingUser.avatar,
              name: user.name || existingUser.name,
              lastLoginAt: new Date().toISOString(),
            });
          } else {
            console.log("GitHub account already linked to user:", linkedUserId);
            // Update last login time
            await redis.hset(`user:${existingUser.id}`, {
              ...existingUser,
              lastLoginAt: new Date().toISOString(),
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/signup",
  },
};

// Helper functions
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

async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await redis.hgetall(`user:${id}`);
    return user as User | null;
  } catch (error) {
    console.error("Error getting user by id:", error);
    return null;
  }
}

async function updateUserProvider(userId: string, provider: AuthProvider, providerAccountId?: string) {
  try {
    const user = await redis.hgetall(`user:${userId}`);
    if (!user) return;

    const updates: Record<string, any> = {
      ...user,
      provider,
      lastLoginAt: new Date().toISOString(),
    };

    if (providerAccountId) {
      updates.providerAccountId = providerAccountId;
    }

    await redis.hset(`user:${userId}`, updates);
  } catch (error) {
    console.error("Error updating user provider:", error);
  }
}

async function updateEmailVerification(userId: string, emailVerified: boolean) {
  try {
    const user = await redis.hgetall(`user:${userId}`);
    if (!user) return;

    await redis.hset(`user:${userId}`, {
      ...user,
      emailVerified,
      status: emailVerified ? 'verified' : user.status,
    });
  } catch (error) {
    console.error("Error updating email verification:", error);
  }
}

async function createGitHubUser(user: any, account: any) {
  try {
    const id = Date.now().toString();
    const newUser = {
      id,
      email: user.email,
      name: user.name || undefined,
      avatar: user.image || undefined,
      role: 'user',
      status: 'verified',
      provider: 'github' as AuthProvider,
      providerAccountId: account.providerAccountId,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    await redis.hset(`user:${id}`, newUser);
    await redis.set(`user_email:${user.email}`, id);
  } catch (error) {
    console.error("Error creating GitHub user:", error);
  }
}
