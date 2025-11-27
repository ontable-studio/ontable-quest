import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Upstash Redis
    STORAGE_KV_REST_API_READ_ONLY_TOKEN: z.string().min(1),
    STORAGE_KV_REST_API_TOKEN: z.string().min(1),
    STORAGE_KV_REST_API_URL: z.url(),
    STORAGE_KV_URL: z.url(),

    // NextAuth.js
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.url().optional(),

    // GitHub OAuth
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
    NEXT_PUBLIC_APP_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_BASE_URL: z.url(),
  },

  runtimeEnv: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,

    STORAGE_KV_REST_API_READ_ONLY_TOKEN:
      process.env.STORAGE_KV_REST_API_READ_ONLY_TOKEN,
    STORAGE_KV_REST_API_TOKEN:
      process.env.STORAGE_KV_REST_API_TOKEN,
    STORAGE_KV_REST_API_URL: process.env.STORAGE_KV_REST_API_URL,
    STORAGE_KV_URL: process.env.STORAGE_KV_URL,

    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

export type Env = typeof env;
