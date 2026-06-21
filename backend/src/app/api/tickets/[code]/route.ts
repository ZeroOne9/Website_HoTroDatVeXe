import { getTicketController } from "@/modules/tickets/ticket.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = getTicketController;
