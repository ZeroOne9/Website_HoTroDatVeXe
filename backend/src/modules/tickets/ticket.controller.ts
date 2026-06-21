import { handleApiError } from "@/lib/api-handler";
import { successResponse, validationErrorResponse } from "@/lib/response";

import { getTicketByCode } from "./ticket.service";
import { ticketCodeSchema } from "./ticket.validator";

type TicketRouteContext = {
  params: {
    code: string;
  };
};

export async function getTicketController(_request: Request, context: TicketRouteContext) {
  const parsed = ticketCodeSchema.safeParse(context.params);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await getTicketByCode(parsed.data.code);

    return successResponse(result, { message: "Lay thong tin ve thanh cong." });
  } catch (error) {
    return handleApiError(error, "Khong the lay thong tin ve.");
  }
}
