import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { getTripSeats } from "@/modules/trips/trip.service";
import { tripIdSchema } from "@/modules/trips/trip.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const parsed = tripIdSchema.safeParse(context.params);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await getTripSeats(parsed.data.id);

    return successResponse(
      result,
      { message: "Lay danh sach ghe thanh cong." },
    );
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the lay danh sach ghe.", 500);
  }
}
