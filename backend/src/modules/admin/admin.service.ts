import { Prisma } from "@prisma/client";

import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import type {
  CreateBusCompanyInput,
  CreateLocationInput,
  CreateRouteInput,
  CreateSeatInput,
  CreateTripInput,
  CreateVehicleInput,
  UpdateRouteStatusInput,
  UpdateTripStatusInput,
  UpdateVehicleStatusInput,
} from "./admin.validator";

export function listAdminLocations() {
  return prisma.location.findMany({
    orderBy: [{ province: "asc" }, { name: "asc" }],
  });
}

export async function createAdminLocation(input: CreateLocationInput) {
  try {
    return await prisma.location.create({
      data: input,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError("Dia diem nay da ton tai.", 409);
    }

    throw error;
  }
}

export function listAdminRoutes() {
  return prisma.route.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      departureLocation: true,
      destinationLocation: true,
    },
  });
}

export async function createAdminRoute(input: CreateRouteInput) {
  const locations = await prisma.location.findMany({
    where: {
      id: {
        in: [input.departureLocationId, input.destinationLocationId],
      },
    },
    select: {
      id: true,
    },
  });

  if (locations.length !== 2) {
    throw new ApiError("Diem di hoac diem den khong ton tai.", 404);
  }

  try {
    return await prisma.route.create({
      data: {
        departureLocationId: input.departureLocationId,
        destinationLocationId: input.destinationLocationId,
        distanceKm: input.distanceKm,
        estimatedMinutes: input.estimatedMinutes,
      },
      include: {
        departureLocation: true,
        destinationLocation: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError("Tuyen xe nay da ton tai.", 409);
    }

    throw error;
  }
}

export function listAdminTrips() {
  return prisma.trip.findMany({
    orderBy: {
      departureTime: "desc",
    },
    include: {
      route: {
        include: {
          departureLocation: true,
          destinationLocation: true,
        },
      },
      vehicle: {
        include: {
          busCompany: true,
        },
      },
      _count: {
        select: {
          bookingSeats: true,
        },
      },
    },
  });
}

export async function createAdminTrip(input: CreateTripInput) {
  const [route, vehicle] = await Promise.all([
    prisma.route.findUnique({
      where: { id: input.routeId },
      select: { id: true, status: true },
    }),
    prisma.vehicle.findUnique({
      where: { id: input.vehicleId },
      select: { id: true, status: true },
    }),
  ]);

  if (!route) {
    throw new ApiError("Tuyen xe khong ton tai.", 404);
  }

  if (route.status !== "active") {
    throw new ApiError("Tuyen xe dang ngung hoat dong.", 409);
  }

  if (!vehicle) {
    throw new ApiError("Xe khong ton tai.", 404);
  }

  if (vehicle.status !== "active") {
    throw new ApiError("Xe khong san sang hoat dong.", 409);
  }

  return prisma.trip.create({
    data: {
      routeId: input.routeId,
      vehicleId: input.vehicleId,
      departureTime: new Date(input.departureTime),
      arrivalTime: input.arrivalTime ? new Date(input.arrivalTime) : undefined,
      priceVnd: input.priceVnd,
      status: input.status ?? "scheduled",
    },
    include: {
      route: {
        include: {
          departureLocation: true,
          destinationLocation: true,
        },
      },
      vehicle: {
        include: {
          busCompany: true,
        },
      },
    },
  });
}

export function listAdminBusCompanies() {
  return prisma.busCompany.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          vehicles: true,
        },
      },
    },
  });
}

export async function createAdminBusCompany(input: CreateBusCompanyInput) {
  try {
    return await prisma.busCompany.create({
      data: input,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError("Nha xe nay da ton tai.", 409);
    }

    throw error;
  }
}

export function listAdminVehicles() {
  return prisma.vehicle.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      busCompany: true,
      _count: {
        select: {
          seats: true,
          trips: true,
        },
      },
    },
  });
}

export async function createAdminVehicle(input: CreateVehicleInput) {
  const busCompany = await prisma.busCompany.findUnique({
    where: { id: input.busCompanyId },
    select: { id: true },
  });

  if (!busCompany) {
    throw new ApiError("Nha xe khong ton tai.", 404);
  }

  try {
    return await prisma.vehicle.create({
      data: {
        busCompanyId: input.busCompanyId,
        licensePlate: input.licensePlate,
        name: input.name,
        vehicleType: input.vehicleType,
        capacity: input.capacity,
        status: input.status ?? "active",
      },
      include: {
        busCompany: true,
        _count: {
          select: {
            seats: true,
            trips: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError("Bien so xe da ton tai.", 409);
    }

    throw error;
  }
}

export async function listAdminVehicleSeats(vehicleId: number) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      busCompany: true,
      seats: {
        orderBy: [{ floor: "asc" }, { rowNumber: "asc" }, { colNumber: "asc" }, { seatCode: "asc" }],
      },
    },
  });

  if (!vehicle) {
    throw new ApiError("Xe khong ton tai.", 404);
  }

  return vehicle;
}

export async function createAdminVehicleSeat(vehicleId: number, input: CreateSeatInput) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: {
      id: true,
      capacity: true,
      _count: {
        select: {
          seats: true,
        },
      },
    },
  });

  if (!vehicle) {
    throw new ApiError("Xe khong ton tai.", 404);
  }

  if (vehicle._count.seats >= vehicle.capacity) {
    throw new ApiError("So ghe da dat toi suc chua cua xe.", 409);
  }

  try {
    return await prisma.seat.create({
      data: {
        vehicleId,
        seatCode: input.seatCode,
        seatType: input.seatType ?? "standard",
        floor: input.floor,
        rowNumber: input.rowNumber,
        colNumber: input.colNumber,
        isActive: input.isActive ?? true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError("Ma ghe da ton tai tren xe nay.", 409);
    }

    throw error;
  }
}

export async function updateAdminRouteStatus(routeId: number, input: UpdateRouteStatusInput) {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    select: {
      id: true,
      status: true,
      _count: {
        select: {
          trips: true,
        },
      },
    },
  });

  if (!route) {
    throw new ApiError("Tuyen xe khong ton tai.", 404);
  }

  if (input.status === "inactive") {
    const scheduledTrips = await prisma.trip.count({
      where: {
        routeId,
        status: "scheduled",
        departureTime: {
          gt: new Date(),
        },
      },
    });

    if (scheduledTrips > 0) {
      throw new ApiError("Khong the ngung tuyen xe khi con chuyen sap khoi hanh.", 409);
    }
  }

  return prisma.route.update({
    where: { id: routeId },
    data: {
      status: input.status,
    },
    include: {
      departureLocation: true,
      destinationLocation: true,
    },
  });
}

export async function updateAdminVehicleStatus(vehicleId: number, input: UpdateVehicleStatusInput) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!vehicle) {
    throw new ApiError("Xe khong ton tai.", 404);
  }

  if (input.status !== "active") {
    const scheduledTrips = await prisma.trip.count({
      where: {
        vehicleId,
        status: "scheduled",
        departureTime: {
          gt: new Date(),
        },
      },
    });

    if (scheduledTrips > 0) {
      throw new ApiError("Khong the doi trang thai xe khi con chuyen sap khoi hanh.", 409);
    }
  }

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      status: input.status,
    },
    include: {
      busCompany: true,
      _count: {
        select: {
          seats: true,
          trips: true,
        },
      },
    },
  });
}

export async function updateAdminTripStatus(tripId: number, input: UpdateTripStatusInput) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!trip) {
      throw new ApiError("Chuyen xe khong ton tai.", 404);
    }

    if (trip.status === "completed" && input.status !== "completed") {
      throw new ApiError("Khong the doi trang thai chuyen xe da hoan thanh.", 409);
    }

    if (trip.status === "departed" && input.status === "scheduled") {
      throw new ApiError("Khong the dua chuyen da khoi hanh ve trang thai scheduled.", 409);
    }

    if (input.status === "cancelled" && trip.status !== "cancelled") {
      await tx.booking.updateMany({
        where: {
          bookingSeats: {
            some: {
              tripId,
            },
          },
          status: {
            in: ["pending", "confirmed"],
          },
        },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      });

      await tx.ticket.updateMany({
        where: {
          bookingSeat: {
            tripId,
          },
          status: "valid",
        },
        data: {
          status: "cancelled",
        },
      });
    }

    return tx.trip.update({
      where: { id: tripId },
      data: {
        status: input.status,
      },
      include: {
        route: {
          include: {
            departureLocation: true,
            destinationLocation: true,
          },
        },
        vehicle: {
          include: {
            busCompany: true,
          },
        },
        _count: {
          select: {
            bookingSeats: true,
          },
        },
      },
    });
  });
}

export function listAdminBookings() {
  return prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      bookingSeats: {
        include: {
          seat: true,
          ticket: true,
          trip: {
            include: {
              route: {
                include: {
                  departureLocation: true,
                  destinationLocation: true,
                },
              },
              vehicle: {
                include: {
                  busCompany: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
