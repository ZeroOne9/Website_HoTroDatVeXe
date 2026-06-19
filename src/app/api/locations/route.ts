import { errorResponse, successResponse } from "@/lib/response";
import { getLocations } from "@/modules/locations/location.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const locations = await getLocations();

    return successResponse(
      { locations },
      { message: "Lay danh sach dia diem thanh cong." },
    );
  } catch {
    return errorResponse("Khong the lay danh sach dia diem.", 500);
  }
}
