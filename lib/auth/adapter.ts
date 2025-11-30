import { Redis } from "@upstash/redis";
import { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters";
import { env } from "@/lib/env";
import { User } from "@/types/common";

const redis = new Redis({
  url: env.STORAGE_KV_REST_API_URL.toString(),
  token: env.STORAGE_KV_REST_API_TOKEN,
});

// Helper functions
async function getUserById(id: string): Promise<AdapterUser | null> {
  const user = await redis.hgetall(`user:${id}`) as Record<string, any>;
  if (!user) return null;

  return {
    id: user.id as string,
    email: user.email as string,
    name: user.name,
    image: user.avatar,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
}

async function getUserByEmail(email: string): Promise<AdapterUser | null> {
  const userId = await redis.get(`user_email:${email}`);
  if (!userId) return null;

  return getUserById(userId as string);
}

export function UpstashAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      const id = Date.now().toString();
      const newUser: User = {
        id,
        email: user.email,
        name: user.name || undefined,
        avatar: user.image || undefined,
        role: 'user',
        status: 'unverified',
        provider: 'credentials', // This will be updated based on the provider
        emailVerified: !!user.emailVerified || undefined,
        createdAt: new Date().toISOString(),
      };

      await redis.hset(`user:${id}`, newUser as unknown as Record<string, unknown>);
      await redis.set(`user_email:${user.email}`, id);

      return {
        id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      };
    },

    getUser: getUserById,
    getUserByEmail: getUserByEmail,

    async getUserByAccount({
      providerAccountId,
      provider,
    }): Promise<AdapterUser | null> {
      const accountKey = `account:${provider}:${providerAccountId}`;
      const userId = await redis.get(accountKey);
      if (!userId) return null;

      return getUserById(userId as string);
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> {
      const existingUser = await redis.hgetall(`user:${user.id}`) as Record<string, any>;
      if (!existingUser) throw new Error("User not found");

      const updatedUser = {
        ...existingUser,
        email: user.email || existingUser.email,
        name: user.name || existingUser.name,
        avatar: user.image || existingUser.avatar,
        emailVerified: user.emailVerified?.toISOString() || existingUser.emailVerified,
      } as Record<string, any>;

      await redis.hset(`user:${user.id}`, updatedUser);

      return {
        id: user.id,
        email: updatedUser.email as string,
        name: updatedUser.name,
        image: updatedUser.avatar,
        emailVerified: updatedUser.emailVerified ? new Date(updatedUser.emailVerified) : null,
      };
    },

    async deleteUser(userId: string): Promise<void> {
      const user = await redis.hgetall(`user:${userId}`);
      if (user) {
        await redis.del(`user_email:${user.email}`);
        await redis.del(`user:${userId}`);

        // Also delete associated accounts
        const accounts = await redis.keys(`account:*:*`);
        for (const accountKey of accounts) {
          const accountUserId = await redis.get(accountKey);
          if (accountUserId === userId) {
            await redis.del(accountKey);
          }
        }
      }
    },

    async linkAccount(account: AdapterAccount): Promise<void> {
      const accountKey = `account:${account.provider}:${account.providerAccountId}`;
      const userAccountKey = `user:${account.userId}:accounts`;

      console.log("Adapter linking account:", {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        userId: account.userId,
        accountKey
      });

      await redis.set(accountKey, account.userId);
      await redis.hset(userAccountKey, {
        [`${account.provider}:${account.providerAccountId}`]: JSON.stringify(account),
      });

      // Update user's provider info
      const user = await redis.hgetall(`user:${account.userId}`);
      if (user) {
        await redis.hset(`user:${account.userId}`, {
          ...user,
          provider: account.provider as any,
          providerAccountId: account.providerAccountId,
        });
        console.log("Updated user provider info for:", account.userId);
      }
    },

    async unlinkAccount({
      providerAccountId,
      provider,
    }): Promise<void> {
      const accountKey = `account:${provider}:${providerAccountId}`;
      const userId = await redis.get(accountKey);

      if (userId) {
        await redis.del(accountKey);
        await redis.hdel(`user:${userId}:accounts`, `${provider}:${providerAccountId}`);
      }
    },

    async createSession({
      sessionToken,
      userId,
      expires,
    }): Promise<AdapterSession> {
      await redis.hset(`session:${sessionToken}`, {
        sessionToken,
        userId,
        expires: expires.toISOString(),
      });

      return {
        sessionToken,
        userId,
        expires,
      };
    },

    async getSessionAndUser(sessionToken: string): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      const session = await redis.hgetall(`session:${sessionToken}`) as Record<string, any>;
      if (!session || new Date(session.expires as string) < new Date()) {
        if (session) await redis.del(`session:${sessionToken}`);
        return null;
      }

      const user = await getUserById(session.userId);
      if (!user) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: new Date(session.expires),
        },
        user,
      };
    },

    async updateSession({
      sessionToken,
      expires,
      userId,
    }): Promise<AdapterSession | null | undefined> {
      const existingSession = await redis.hgetall(`session:${sessionToken}`) as Record<string, any>;
      if (!existingSession) return null;

      await redis.hset(`session:${sessionToken}`, {
        sessionToken,
        userId: userId || existingSession.userId,
        expires: expires?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
      });

      return {
        sessionToken,
        userId: userId || (existingSession.userId as string),
        expires: expires || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    },

    async deleteSession(sessionToken: string): Promise<void> {
      await redis.del(`session:${sessionToken}`);
    },

    async createVerificationToken({
      identifier,
      expires,
      token,
    }): Promise<VerificationToken | null> {
      const verificationToken = {
        identifier,
        token,
        expires,
      };

      await redis.hset(`verification:${token}`, {
        identifier,
        token,
        expires: expires.toISOString(),
      });

      return verificationToken;
    },

    async useVerificationToken({
      identifier,
      token,
    }): Promise<VerificationToken | null> {
      const verificationToken = await redis.hgetall(`verification:${token}`) as Record<string, any>;
      if (!verificationToken) return null;

      await redis.del(`verification:${token}`);

      return {
        identifier: verificationToken.identifier as string,
        token: verificationToken.token as string,
        expires: new Date(verificationToken.expires as string),
      };
    },
  };
}