import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { publicUserSelect, setAuthCookie, signAuthToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { registerSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { fullName, email, phone, password } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, ...(phone ? [{ phone }] : [])],
    },
    select: {
      email: true,
      phone: true,
    },
  });

  if (existingUser?.email === email) {
    return errorResponse("Email da duoc su dung.", 409);
  }

  if (phone && existingUser?.phone === phone) {
    return errorResponse("So dien thoai da duoc su dung.", 409);
  }

  try {
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash: await hashPassword(password),
      },
      select: publicUserSelect,
    });

    const token = signAuthToken(user);
    const response = successResponse(
      {
        user,
        token,
      },
      {
        status: 201,
        message: "Dang ky thanh cong.",
      },
    );

    return setAuthCookie(response, token);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse("Email hoac so dien thoai da duoc su dung.", 409);
    }

    return errorResponse("Khong the dang ky tai khoan.", 500);
  }
}
