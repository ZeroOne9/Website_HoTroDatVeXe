import {
  createAdminBusCompanyController,
  listAdminBusCompaniesController,
} from "@/modules/admin/admin.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = listAdminBusCompaniesController;
export const POST = createAdminBusCompanyController;
