import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { createBooking } from "@/modules/bookings/booking.service";
import { createBookingSchema } from "@/modules/bookings/booking.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const user = await getCurrentUser(request);
    const result = await createBooking(parsed.data, user);

    return successResponse(result, {
      status: 201,
      message: "Dat ve thanh cong. Vui long thanh toan de xac nhan ve.",
    });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the dat ve.", 500);
  }
}
