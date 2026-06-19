import type { PublicUser } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import type { CreateBookingInput } from "./booking.validator";

const BOOKING_HOLD_MINUTES = 15;

function createBookingCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `BK${Date.now()}${random}`;
}

function createTicketCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `TK${Date.now()}${random}`;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getActiveSeatHoldWhere() {
  return {
    OR: [
      { status: "confirmed" as const },
      {
        status: "pending" as const,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    ],
  };
}

const bookingDetailSelect = {
  id: true,
  bookingCode: true,
  passengerName: true,
  passengerPhone: true,
  passengerEmail: true,
  fareVnd: true,
  status: true,
  expiresAt: true,
  confirmedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
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
            },
          },
          destinationLocation: {
            select: {
              id: true,
              name: true,
              province: true,
            },
          },
        },
      },
      vehicle: {
        select: {
          id: true,
          name: true,
          vehicleType: true,
          busCompany: {
            select: {
              id: true,
              name: true,
              phone: true,
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
  ticket: {
    select: {
      id: true,
      code: true,
      qrCode: true,
      status: true,
      issuedAt: true,
      usedAt: true,
    },
  },
} as const;

export async function createBooking(input: CreateBookingInput, user: PublicUser | null) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: input.tripId },
      select: {
        id: true,
        vehicleId: true,
        priceVnd: true,
        departureTime: true,
        status: true,
        route: {
          select: {
            id: true,
            departureLocation: {
              select: {
                id: true,
                name: true,
                province: true,
              },
            },
            destinationLocation: {
              select: {
                id: true,
                name: true,
                province: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            vehicleType: true,
            busCompany: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new ApiError("Khong tim thay chuyen xe.", 404);
    }

    if (trip.status !== "scheduled") {
      throw new ApiError("Chuyen xe khong con nhan dat ve.", 409);
    }

    if (trip.departureTime <= new Date()) {
      throw new ApiError("Chuyen xe da qua thoi gian khoi hanh.", 409);
    }

    const seat = await tx.seat.findFirst({
      where: {
        id: input.seatId,
        vehicleId: trip.vehicleId,
        isActive: true,
      },
      select: {
        id: true,
        seatCode: true,
        seatType: true,
        floor: true,
        rowNumber: true,
        colNumber: true,
      },
    });

    if (!seat) {
      throw new ApiError("Ghe khong ton tai hoac khong thuoc chuyen xe nay.", 404);
    }

    const existingBooking = await tx.booking.findFirst({
      where: {
        tripId: trip.id,
        seatId: seat.id,
        ...getActiveSeatHoldWhere(),
      },
      select: {
        id: true,
      },
    });

    if (existingBooking) {
      throw new ApiError("Ghe nay da duoc dat.", 409);
    }

    const booking = await tx.booking.create({
      data: {
        bookingCode: createBookingCode(),
        userId: user?.id,
        tripId: trip.id,
        seatId: seat.id,
        passengerName: input.passengerName,
        passengerPhone: input.passengerPhone,
        passengerEmail: input.passengerEmail,
        fareVnd: trip.priceVnd,
        status: "pending",
        expiresAt: addMinutes(new Date(), BOOKING_HOLD_MINUTES),
      },
      select: {
        id: true,
        bookingCode: true,
        passengerName: true,
        passengerPhone: true,
        passengerEmail: true,
        fareVnd: true,
        status: true,
        expiresAt: true,
        confirmedAt: true,
        cancelledAt: true,
        createdAt: true,
        tripId: true,
        seatId: true,
      },
    });

    return {
      booking,
      trip,
      seat,
    };
  });
}

export async function getBookingByCode(bookingCode: string) {
  const booking = await prisma.booking.findUnique({
    where: { bookingCode },
    select: bookingDetailSelect,
  });

  if (!booking) {
    throw new ApiError("Khong tim thay thong tin dat ve.", 404);
  }

  return { booking };
}

export async function confirmBooking(bookingCode: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { bookingCode },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        ticket: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!booking) {
      throw new ApiError("Khong tim thay thong tin dat ve.", 404);
    }

    if (booking.status === "confirmed") {
      const confirmedBooking = await tx.booking.findUniqueOrThrow({
        where: { bookingCode },
        select: bookingDetailSelect,
      });

      return { booking: confirmedBooking };
    }

    if (booking.status !== "pending") {
      throw new ApiError("Chi co the xac nhan booking dang cho thanh toan.", 409);
    }

    if (booking.expiresAt && booking.expiresAt <= new Date()) {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "expired",
        },
      });

      throw new ApiError("Booking da het thoi gian giu cho.", 409);
    }

    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
      },
    });

    if (!booking.ticket) {
      await tx.ticket.create({
        data: {
          bookingId: booking.id,
          code: createTicketCode(),
          qrCode: bookingCode,
        },
      });
    }

    const confirmedBooking = await tx.booking.findUniqueOrThrow({
      where: { bookingCode },
      select: bookingDetailSelect,
    });

    return { booking: confirmedBooking };
  });
}

export async function cancelBooking(bookingCode: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { bookingCode },
      select: {
        id: true,
        status: true,
        trip: {
          select: {
            departureTime: true,
            status: true,
          },
        },
        ticket: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!booking) {
      throw new ApiError("Khong tim thay thong tin dat ve.", 404);
    }

    if (booking.status === "cancelled") {
      const cancelledBooking = await tx.booking.findUniqueOrThrow({
        where: { bookingCode },
        select: bookingDetailSelect,
      });

      return { booking: cancelledBooking };
    }

    if (booking.status === "expired") {
      throw new ApiError("Booking da het han, khong can huy.", 409);
    }

    if (booking.trip.status !== "scheduled") {
      throw new ApiError("Chi co the huy ve cua chuyen xe chua khoi hanh.", 409);
    }

    if (booking.trip.departureTime <= new Date()) {
      throw new ApiError("Khong the huy ve sau thoi gian khoi hanh.", 409);
    }

    if (booking.ticket?.status === "used") {
      throw new ApiError("Ve da duoc su dung, khong the huy.", 409);
    }

    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    if (booking.ticket && booking.ticket.status !== "cancelled") {
      await tx.ticket.update({
        where: { id: booking.ticket.id },
        data: {
          status: "cancelled",
        },
      });
    }

    const cancelledBooking = await tx.booking.findUniqueOrThrow({
      where: { bookingCode },
      select: bookingDetailSelect,
    });

    return { booking: cancelledBooking };
  });
}
