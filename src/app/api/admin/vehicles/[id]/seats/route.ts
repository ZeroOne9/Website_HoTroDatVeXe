import type { NextRequest } from "next/server";

import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { requireAdmin } from "@/modules/admin/admin.auth";
import { createAdminVehicleSeat, listAdminVehicleSeats } from "@/modules/admin/admin.service";
import { createSeatSchema, vehicleIdParamSchema } from "@/modules/admin/admin.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const parsedParams = vehicleIdParamSchema.safeParse(context.params);

  if (!parsedParams.success) {
    return validationErrorResponse(parsedParams.error);
  }

  try {
    await requireAdmin(request);
    const vehicle = await listAdminVehicleSeats(parsedParams.data.id);

    return successResponse({ vehicle }, { message: "Lay danh sach ghe thanh cong." });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the lay danh sach ghe.", 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const parsedParams = vehicleIdParamSchema.safeParse(context.params);

  if (!parsedParams.success) {
    return validationErrorResponse(parsedParams.error);
  }

  const body = await request.json().catch(() => null);
  const parsedBody = createSeatSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationErrorResponse(parsedBody.error);
  }

  try {
    await requireAdmin(request);
    const seat = await createAdminVehicleSeat(parsedParams.data.id, parsedBody.data);

    return successResponse({ seat }, {
      status: 201,
      message: "Tao ghe thanh cong.",
    });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the tao ghe.", 500);
  }
}
