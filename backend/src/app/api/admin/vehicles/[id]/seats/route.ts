import {
  createAdminVehicleSeatController,
  listAdminVehicleSeatsController,
} from "@/modules/admin/admin.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = listAdminVehicleSeatsController;
export const POST = createAdminVehicleSeatController;
