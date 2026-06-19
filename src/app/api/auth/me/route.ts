import type { NextRequest } from "next/server";

import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse } from "@/lib/response";
import { getAuthenticatedUser } from "@/modules/auth/auth.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    return successResponse({ user }, { message: "Lay thong tin tai khoan thanh cong." });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the lay thong tin tai khoan.", 500);
  }
}
