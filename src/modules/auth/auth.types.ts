import type { PublicUser } from "@/lib/auth";

export type AuthResult = {
  user: PublicUser;
  token: string;
};
