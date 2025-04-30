// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    id?: number;
    jwt?: string;
    username?: string;
    email?: string;
    roleName?: string;
  }

  interface User {
    id: number;
    jwt: string;
    username: string;
    email: string;
    role?: {
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
    jwt?: string;
    username?: string;
    email?: string;
    roleName?: string;
  }
}
