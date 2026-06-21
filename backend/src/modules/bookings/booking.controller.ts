import type { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-handler";
import { getCurrentUser } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { successResponse, validationErrorResponse } from "@/lib/response";

import { cancelBooking, confirmBooking, createBooking, getBookingByCode, getMyBookings } from "./booking.service";
import { bookingCodeSchema, createBookingSchema } from "./booking.validator";

type BookingRouteContext = {
  params: {
    bookingCode: string;
  };
};

export async function createBookingController(request: NextRequest) {
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
    return handleApiError(error, "Khong the dat ve.");
  }
}

export async function getBookingController(_request: Request, context: BookingRouteContext) {
  const parsed = bookingCodeSchema.safeParse(context.params);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await getBookingByCode(parsed.data.bookingCode);

    return successResponse(result, { message: "Lay thong tin dat ve thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the lay thong tin dat ve.");
  }
}

export async function getMyBookingsController(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      throw new ApiError("Vui long dang nhap.", 401);
    }

    const result = await getMyBookings(user.id);

    return successResponse(result, { message: "Lay danh sach dat ve cua toi thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the lay danh sach dat ve cua toi.");
  }
}

export async function confirmBookingController(_request: Request, context: BookingRouteContext) {
  const parsed = bookingCodeSchema.safeParse(context.params);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await confirmBooking(parsed.data.bookingCode);

    return successResponse(result, { message: "Xac nhan dat ve thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the xac nhan dat ve.");
  }
}

export async function cancelBookingController(_request: Request, context: BookingRouteContext) {
  const parsed = bookingCodeSchema.safeParse(context.params);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await cancelBooking(parsed.data.bookingCode);

    return successResponse(result, { message: "Huy dat ve thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the huy dat ve.");
  }
}
