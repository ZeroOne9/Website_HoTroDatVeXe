import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function getTicketByCode(code: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      qrCode: true,
      status: true,
      issuedAt: true,
      usedAt: true,
      booking: {
        select: {
          id: true,
          bookingCode: true,
          passengerName: true,
          passengerPhone: true,
          passengerEmail: true,
          fareVnd: true,
          status: true,
          confirmedAt: true,
          createdAt: true,
          trip: {
            select: {
              id: true,
              departureTime: true,
              arrivalTime: true,
              priceVnd: true,
              status: true,
              route: {
                select: {
                  id: true,
                  departureLocation: {
                    select: {
                      id: true,
                      name: true,
                      province: true,
                      address: true,
                    },
                  },
                  destinationLocation: {
                    select: {
                      id: true,
                      name: true,
                      province: true,
                      address: true,
                    },
                  },
                },
              },
              vehicle: {
                select: {
                  id: true,
                  name: true,
                  licensePlate: true,
                  vehicleType: true,
                  busCompany: {
                    select: {
                      id: true,
                      name: true,
                      phone: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          seat: {
            select: {
              id: true,
              seatCode: true,
              seatType: true,
              floor: true,
              rowNumber: true,
              colNumber: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    throw new ApiError("Khong tim thay ve.", 404);
  }

  return { ticket };
}
