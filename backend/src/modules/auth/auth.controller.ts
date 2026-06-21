import type { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-handler";
import { clearAuthCookie, setAuthCookie } from "@/lib/auth";
import { successResponse, validationErrorResponse } from "@/lib/response";

import { getAuthenticatedUser, loginUser, registerUser } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validator";

export async function registerController(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await registerUser(parsed.data);
    const response = successResponse(result, {
      status: 201,
      message: "Dang ky thanh cong.",
    });

    return setAuthCookie(response, result.token);
  } catch (error) {
    return handleApiError(error, "Khong the dang ky tai khoan.");
  }
}

export async function loginController(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await loginUser(parsed.data);
    const response = successResponse(result, {
      message: "Dang nhap thanh cong.",
    });

    return setAuthCookie(response, result.token);
  } catch (error) {
    return handleApiError(error, "Khong the dang nhap.");
  }
}

export async function getMeController(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    return successResponse({ user }, { message: "Lay thong tin tai khoan thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the lay thong tin tai khoan.");
  }
}

export async function logoutController() {
  const response = successResponse({ loggedOut: true }, { message: "Dang xuat thanh cong." });

  return clearAuthCookie(response);
}
