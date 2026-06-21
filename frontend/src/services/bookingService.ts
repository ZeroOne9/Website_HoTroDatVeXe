import { apiClient } from "@/services/apiClient";
import type { BookingDetail, CreateBookingResult } from "@/services/types";

export type CreateBookingPayload = {
  tripId: number;
  seatIds: number[];
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
};

export const bookingService = {
  createBooking(payload: CreateBookingPayload) {
    return apiClient.post<CreateBookingResult>("/api/bookings", payload);
  },

  getBooking(bookingCode: string) {
    return apiClient.get<{ booking: BookingDetail }>(`/api/bookings/${bookingCode}`);
  },

  confirmBooking(bookingCode: string) {
    return apiClient.post<{ booking: BookingDetail }>(`/api/bookings/${bookingCode}/confirm`);
  },

  cancelBooking(bookingCode: string) {
    return apiClient.post<{ booking: BookingDetail }>(`/api/bookings/${bookingCode}/cancel`);
  },

  getMyBookings() {
    return apiClient.get<{ bookings: BookingDetail[] }>("/api/bookings/me");
  },
};
