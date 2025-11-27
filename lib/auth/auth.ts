import NextAuth from "next-auth";
import { authConfig } from "./config";
import { AuthUser } from "@/types/common";

declare module "next-auth" {
  interface Session {
    user: AuthUser;
  }
  interface User {
    role?: string;
    status?: string;
    provider?: string;
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);