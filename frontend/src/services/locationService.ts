import { apiClient } from "@/services/apiClient";
import type { LocationItem } from "@/services/types";

export const locationService = {
  getLocations() {
    return apiClient.get<{ locations: LocationItem[] }>("/api/locations");
  },
};
