import { apiClient } from "@/services/apiClient";
import type { BookingDetail } from "@/services/types";

export const adminService = {
  getBookings() {
    return apiClient.get<{ bookings: BookingDetail[] }>("/api/admin/bookings");
  },
  
  cancelBooking(bookingCode: string) {
    return apiClient.post<{ booking: BookingDetail }>(`/api/admin/bookings/${bookingCode}/cancel`);
  },

  getTrips() {
    return apiClient.get<{ trips: any[] }>("/api/admin/trips");
  },

  createTrip(data: any) {
    return apiClient.post<{ trip: any }>("/api/admin/trips", data);
  },

  updateTripStatus(tripId: number, status: string) {
    return apiClient.patch<{ trip: any }>(`/api/admin/trips/${tripId}`, { status });
  },

  getRoutes() {
    return apiClient.get<{ routes: any[] }>("/api/admin/routes");
  },

  getVehicles() {
    return apiClient.get<{ vehicles: any[] }>("/api/admin/vehicles");
  }
};
