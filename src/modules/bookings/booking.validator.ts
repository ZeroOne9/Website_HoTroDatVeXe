import { z } from "zod";

const idSchema = z.coerce
  .number()
  .int("ID phai la so nguyen.")
  .positive("ID khong hop le.");

export const createBookingSchema = z.object({
  tripId: idSchema,
  seatId: idSchema,
  passengerName: z
    .string()
    .trim()
    .min(2, "Ten hanh khach phai co it nhat 2 ky tu.")
    .max(120, "Ten hanh khach khong duoc vuot qua 120 ky tu."),
  passengerPhone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "So dien thoai khong hop le."),
  passengerEmail: z
    .preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .trim()
        .email("Email khong hop le.")
        .max(191, "Email khong duoc vuot qua 191 ky tu.")
        .toLowerCase()
        .optional(),
    ),
});

export const bookingCodeSchema = z.object({
  bookingCode: z
    .string()
    .trim()
    .min(3, "Ma dat ve khong hop le.")
    .max(40, "Ma dat ve khong hop le."),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingCodeInput = z.infer<typeof bookingCodeSchema>;
