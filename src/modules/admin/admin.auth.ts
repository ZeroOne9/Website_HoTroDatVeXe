import type { NextRequest } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

export async function requireAdmin(request: NextRequest) {
  const admin = await getCurrentAdmin(request);

  if (!admin) {
    throw new ApiError("Ban khong co quyen truy cap chuc nang quan tri.", 403);
  }

  return admin;
}
