import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return errorResponse("Vui long dang nhap.", 401);
  }

  return successResponse({ user }, { message: "Lay thong tin tai khoan thanh cong." });
}
