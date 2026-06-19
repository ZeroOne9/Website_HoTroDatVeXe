import type { NextRequest } from "next/server";

import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { requireAdmin } from "@/modules/admin/admin.auth";
import { createAdminBusCompany, listAdminBusCompanies } from "@/modules/admin/admin.service";
import { createBusCompanySchema } from "@/modules/admin/admin.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const busCompanies = await listAdminBusCompanies();

    return successResponse({ busCompanies }, { message: "Lay danh sach nha xe thanh cong." });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the lay danh sach nha xe.", 500);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createBusCompanySchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    await requireAdmin(request);
    const busCompany = await createAdminBusCompany(parsed.data);

    return successResponse({ busCompany }, {
      status: 201,
      message: "Tao nha xe thanh cong.",
    });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the tao nha xe.", 500);
  }
}
