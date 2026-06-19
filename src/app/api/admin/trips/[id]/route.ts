import type { NextRequest } from "next/server";

import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { requireAdmin } from "@/modules/admin/admin.auth";
import { updateAdminTripStatus } from "@/modules/admin/admin.service";
import { idParamSchema, updateTripStatusSchema } from "@/modules/admin/admin.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const parsedParams = idParamSchema.safeParse(context.params);

  if (!parsedParams.success) {
    return validationErrorResponse(parsedParams.error);
  }

  const body = await request.json().catch(() => null);
  const parsedBody = updateTripStatusSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationErrorResponse(parsedBody.error);
  }

  try {
    await requireAdmin(request);
    const trip = await updateAdminTripStatus(parsedParams.data.id, parsedBody.data);

    return successResponse({ trip }, { message: "Cap nhat chuyen xe thanh cong." });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the cap nhat chuyen xe.", 500);
  }
}
