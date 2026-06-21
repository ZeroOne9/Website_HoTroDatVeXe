import { handleApiError } from "@/lib/api-handler";
import { successResponse } from "@/lib/response";

import { getLocations } from "./location.service";

export async function getLocationsController() {
  try {
    const locations = await getLocations();

    return successResponse({ locations }, { message: "Lay danh sach dia diem thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the lay danh sach dia diem.");
  }
}
