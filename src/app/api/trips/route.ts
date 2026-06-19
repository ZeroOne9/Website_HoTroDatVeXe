import type { NextRequest } from "next/server";

import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { searchTrips } from "@/modules/trips/trip.service";
import { tripSearchSchema } from "@/modules/trips/trip.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsed = tripSearchSchema.safeParse({
    departureLocationId: searchParams.get("departureLocationId"),
    destinationLocationId: searchParams.get("destinationLocationId"),
    date: searchParams.get("date"),
  });

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const trips = await searchTrips(parsed.data);

    return successResponse(
      { trips },
      { message: "Tim chuyen xe thanh cong." },
    );
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the tim chuyen xe.", 500);
  }
}
