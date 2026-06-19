import type { NextRequest } from "next/server";

import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { requireAdmin } from "@/modules/admin/admin.auth";
import { createAdminVehicle, listAdminVehicles } from "@/modules/admin/admin.service";
import { createVehicleSchema } from "@/modules/admin/admin.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const vehicles = await listAdminVehicles();

    return successResponse({ vehicles }, { message: "Lay danh sach xe thanh cong." });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the lay danh sach xe.", 500);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createVehicleSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    await requireAdmin(request);
    const vehicle = await createAdminVehicle(parsed.data);

    return successResponse({ vehicle }, {
      status: 201,
      message: "Tao xe thanh cong.",
    });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the tao xe.", 500);
  }
}
