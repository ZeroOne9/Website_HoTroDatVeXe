import type { UserRole, UserStatus } from "@prisma/client";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "auth_token";

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type PublicUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthTokenPayload = JwtPayload & {
  userId: number;
  email: string;
  role: UserRole;
};

export const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function signAuthToken(user: Pick<PublicUser, "id" | "email" | "role">): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_MAX_AGE_SECONDS },
  );
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded === "string") {
      return null;
    }

    if (
      typeof decoded.userId !== "number" ||
      typeof decoded.email !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return null;
    }

    return decoded as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(request: NextRequest): Promise<PublicUser | null> {
  const token = getAuthTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: publicUserSelect,
  });

  if (!user || user.status !== "active") {
    return null;
  }

  return user;
}

export async function getCurrentAdmin(request: NextRequest): Promise<PublicUser | null> {
  const user = await getCurrentUser(request);

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
