import { createBookingController } from "@/modules/bookings/booking.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createBookingController;
