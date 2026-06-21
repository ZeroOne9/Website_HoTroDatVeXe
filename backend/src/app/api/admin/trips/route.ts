import { createAdminTripController, listAdminTripsController } from "@/modules/admin/admin.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = listAdminTripsController;
export const POST = createAdminTripController;
