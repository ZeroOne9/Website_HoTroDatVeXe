import { getMyBookingsController } from "@/modules/bookings/booking.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = getMyBookingsController;
