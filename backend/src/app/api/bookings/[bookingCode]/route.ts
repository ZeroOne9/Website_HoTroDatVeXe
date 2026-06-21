import { getBookingController } from "@/modules/bookings/booking.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = getBookingController;
