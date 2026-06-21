import { searchTripsController } from "@/modules/trips/trip.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = searchTripsController;
