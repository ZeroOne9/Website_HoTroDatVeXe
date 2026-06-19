import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { getBookingByCode } from "@/modules/bookings/booking.service";
import { bookingCodeSchema } from "@/modules/bookings/booking.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    bookingCode: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const parsed = bookingCodeSchema.safeParse(context.params);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await getBookingByCode(parsed.data.bookingCode);

    return successResponse(result, {
      message: "Lay thong tin dat ve thanh cong.",
    });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the lay thong tin dat ve.", 500);
  }
}
