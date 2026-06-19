import type { NextRequest } from "next/server";

import { setAuthCookie } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { registerUser } from "@/modules/auth/auth.service";
import { registerSchema } from "@/modules/auth/auth.validator";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await registerUser(parsed.data);
    const response = successResponse(
      result,
      {
        status: 201,
        message: "Dang ky thanh cong.",
      },
    );

    return setAuthCookie(response, result.token);
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the dang ky tai khoan.", 500);
  }
}
