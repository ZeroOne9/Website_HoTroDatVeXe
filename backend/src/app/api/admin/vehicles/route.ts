import { createAdminVehicleController, listAdminVehiclesController } from "@/modules/admin/admin.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = listAdminVehiclesController;
export const POST = createAdminVehicleController;
