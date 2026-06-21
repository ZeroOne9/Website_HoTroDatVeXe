import { z } from "zod";

export const ticketCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Ma ve khong hop le.")
    .max(40, "Ma ve khong hop le."),
});

export type TicketCodeInput = z.infer<typeof ticketCodeSchema>;
