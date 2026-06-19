import type { NextRequest } from "next/server";

import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { requireAdmin } from "@/modules/admin/admin.auth";
import { createAdminLocation, listAdminLocations } from "@/modules/admin/admin.service";
import { createLocationSchema } from "@/modules/admin/admin.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const locations = await listAdminLocations();

    return successResponse({ locations }, { message: "Lay danh sach dia diem thanh cong." });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the lay danh sach dia diem.", 500);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createLocationSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    await requireAdmin(request);
    const location = await createAdminLocation(parsed.data);

    return successResponse({ location }, {
      status: 201,
      message: "Tao dia diem thanh cong.",
    });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the tao dia diem.", 500);
  }
}
