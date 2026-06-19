import { isApiError } from "@/lib/errors";
import { errorResponse, successResponse, validationErrorResponse } from "@/lib/response";
import { getTicketByCode } from "@/modules/tickets/ticket.service";
import { ticketCodeSchema } from "@/modules/tickets/ticket.validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    code: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const parsed = ticketCodeSchema.safeParse(context.params);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await getTicketByCode(parsed.data.code);

    return successResponse(result, {
      message: "Lay thong tin ve thanh cong.",
    });
  } catch (error) {
    if (isApiError(error)) {
      return errorResponse(error.message, error.status, error.errors);
    }

    return errorResponse("Khong the lay thong tin ve.", 500);
  }
}
