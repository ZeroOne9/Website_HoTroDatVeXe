import type { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-handler";
import { successResponse, validationErrorResponse } from "@/lib/response";

import { getTripSeats, searchTrips } from "./trip.service";
import { tripIdSchema, tripSearchSchema } from "./trip.validator";

type TripSeatRouteContext = {
  params: {
    id: string;
  };
};

export async function searchTripsController(request: NextRequest) {
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

    return successResponse({ trips }, { message: "Tim chuyen xe thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the tim chuyen xe.");
  }
}

export async function getTripSeatsController(_request: Request, context: TripSeatRouteContext) {
  const parsed = tripIdSchema.safeParse(context.params);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await getTripSeats(parsed.data.id);

    return successResponse(result, { message: "Lay danh sach ghe thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the lay danh sach ghe.");
  }
}
