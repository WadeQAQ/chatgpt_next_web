import "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email?: string | null;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email?: string | null;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email?: string | null;
    role: UserRole;
  }
} 