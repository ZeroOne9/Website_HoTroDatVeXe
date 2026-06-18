import type { NextRequest } from "next/server";

import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { loginSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      passwordHash: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return errorResponse("Email hoac mat khau khong dung.", 401);
  }

  if (user.status !== "active") {
    return errorResponse("Tai khoan dang bi khoa.", 403);
  }

  const publicUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  const token = signAuthToken(publicUser);
  const response = successResponse(
    {
      user: publicUser,
      token,
    },
    {
      message: "Dang nhap thanh cong.",
    },
  );

  return setAuthCookie(response, token);
}
