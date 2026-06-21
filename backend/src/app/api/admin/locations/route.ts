import { createAdminLocationController, listAdminLocationsController } from "@/modules/admin/admin.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = listAdminLocationsController;
export const POST = createAdminLocationController;
