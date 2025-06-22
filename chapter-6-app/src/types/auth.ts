import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    accessToken?: string;
  }
} 