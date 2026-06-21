const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function atTime(date, hours, minutes = 0) {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

async function upsertLocation(data) {
  return prisma.location.upsert({
    where: {
      name_province: {
        name: data.name,
        province: data.province,
      },
    },
    update: data,
    create: data,
  });
}

async function upsertRoute(departureLocationId, destinationLocationId, data) {
  return prisma.route.upsert({
    where: {
      departureLocationId_destinationLocationId: {
        departureLocationId,
        destinationLocationId,
      },
    },
    update: data,
    create: {
      departureLocationId,
      destinationLocationId,
      ...data,
    },
  });
}

async function ensureSeats(vehicleId, seatType = "sleeper") {
  const seatCodes = [
    ...Array.from({ length: 17 }, (_, index) => `A${String(index + 1).padStart(2, "0")}`),
    ...Array.from({ length: 17 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`),
  ];

  for (const [index, seatCode] of seatCodes.entries()) {
    await prisma.seat.upsert({
      where: {
        vehicleId_seatCode: {
          vehicleId,
          seatCode,
        },
      },
      update: {
        seatType,
        floor: seatCode.startsWith("A") ? 1 : 2,
        rowNumber: (index % 17) + 1,
        colNumber: index % 2 === 0 ? 1 : 2,
        isActive: true,
      },
      create: {
        vehicleId,
        seatCode,
        seatType,
        floor: seatCode.startsWith("A") ? 1 : 2,
        rowNumber: (index % 17) + 1,
        colNumber: index % 2 === 0 ? 1 : 2,
      },
    });
  }
}

async function createTrip(routeId, vehicleId, departureDate, estimatedMinutes, priceVnd) {
  const arrivalTime = new Date(departureDate.getTime() + estimatedMinutes * 60 * 1000);

  const existingTrip = await prisma.trip.findFirst({
    where: {
      routeId,
      vehicleId,
      departureTime: departureDate,
    },
  });

  if (existingTrip) {
    return prisma.trip.update({
      where: { id: existingTrip.id },
      data: {
        arrivalTime,
        priceVnd,
        status: "scheduled",
      },
    });
  }

  return prisma.trip.create({
    data: {
      routeId,
      vehicleId,
      departureTime: departureDate,
      arrivalTime,
      priceVnd,
    },
  });
}

async function createDemoBooking({ bookingCode, userId, trip, passengerName, passengerPhone, passengerEmail, seatCodes, status }) {
  const existingBooking = await prisma.booking.findUnique({
    where: { bookingCode },
    select: { id: true },
  });

  if (existingBooking) {
    return existingBooking;
  }

  const seats = await prisma.seat.findMany({
    where: {
      vehicleId: trip.vehicleId,
      seatCode: {
        in: seatCodes,
      },
      isActive: true,
    },
    orderBy: {
      seatCode: "asc",
    },
    select: {
      id: true,
      seatCode: true,
    },
  });

  if (seats.length !== seatCodes.length) {
    throw new Error(`Khong tim thay du ghe demo cho booking ${bookingCode}.`);
  }

  const booking = await prisma.booking.create({
    data: {
      bookingCode,
      userId,
      passengerName,
      passengerPhone,
      passengerEmail,
      totalFareVnd: trip.priceVnd * seats.length,
      status,
      expiresAt: status === "pending" ? addDays(new Date(), 1) : null,
      confirmedAt: status === "confirmed" ? new Date() : null,
      cancelledAt: status === "cancelled" ? new Date() : null,
      bookingSeats: {
        create: seats.map((seat) => ({
          tripId: trip.id,
          seatId: seat.id,
          fareVnd: trip.priceVnd,
        })),
      },
    },
    include: {
      bookingSeats: {
        include: {
          seat: true,
        },
      },
    },
  });

  if (status === "confirmed") {
    for (const bookingSeat of booking.bookingSeats) {
      await prisma.ticket.create({
        data: {
          bookingSeatId: bookingSeat.id,
          code: `TKDEMO${booking.id}${bookingSeat.seat.seatCode}`,
          qrCode: `${bookingCode}:${bookingSeat.id}`,
        },
      });
    }
  }

  return booking;
}

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@datvexe.local" },
    update: {
      fullName: "Quan tri vien",
      phone: "0900000001",
      passwordHash,
      role: "admin",
      status: "active",
    },
    create: {
      fullName: "Quan tri vien",
      email: "admin@datvexe.local",
      phone: "0900000001",
      passwordHash,
      role: "admin",
    },
  });

  const demoPassenger = await prisma.user.upsert({
    where: { email: "passenger.demo@datvexe.local" },
    update: {
      fullName: "Nguyen Van Demo",
      phone: "0900000002",
      passwordHash,
      role: "passenger",
      status: "active",
    },
    create: {
      fullName: "Nguyen Van Demo",
      email: "passenger.demo@datvexe.local",
      phone: "0900000002",
      passwordHash,
      role: "passenger",
    },
  });

  const locations = {
    hcm: await upsertLocation({
      name: "Ben xe Mien Dong",
      province: "TP. Ho Chi Minh",
      address: "292 Dinh Bo Linh, Binh Thanh",
    }),
    daLat: await upsertLocation({
      name: "Ben xe Da Lat",
      province: "Lam Dong",
      address: "01 To Hien Thanh, Da Lat",
    }),
    nhaTrang: await upsertLocation({
      name: "Ben xe Phia Nam Nha Trang",
      province: "Khanh Hoa",
      address: "Km so 6, duong 23/10, Nha Trang",
    }),
    canTho: await upsertLocation({
      name: "Ben xe Trung tam Can Tho",
      province: "Can Tho",
      address: "91B Nguyen Van Linh, Ninh Kieu",
    }),
  };

  const phuongTrang = await prisma.busCompany.upsert({
    where: { name: "Phuong Trang" },
    update: {
      phone: "19006067",
      email: "support@phuongtrang.example",
      address: "TP. Ho Chi Minh",
      description: "Nha xe duong dai phuc vu nhieu tuyen mien Nam.",
    },
    create: {
      name: "Phuong Trang",
      phone: "19006067",
      email: "support@phuongtrang.example",
      address: "TP. Ho Chi Minh",
      description: "Nha xe duong dai phuc vu nhieu tuyen mien Nam.",
    },
  });

  const thanhBuoi = await prisma.busCompany.upsert({
    where: { name: "Thanh Buoi" },
    update: {
      phone: "19006079",
      email: "support@thanhbuoi.example",
      address: "TP. Ho Chi Minh",
      description: "Nha xe chuyen tuyen TP. Ho Chi Minh di Da Lat.",
    },
    create: {
      name: "Thanh Buoi",
      phone: "19006079",
      email: "support@thanhbuoi.example",
      address: "TP. Ho Chi Minh",
      description: "Nha xe chuyen tuyen TP. Ho Chi Minh di Da Lat.",
    },
  });

  const vehicles = {
    ft01: await prisma.vehicle.upsert({
      where: { licensePlate: "51B-12345" },
      update: {
        busCompanyId: phuongTrang.id,
        name: "PT Limousine 34G",
        vehicleType: "Giuong nam",
        capacity: 34,
        status: "active",
      },
      create: {
        busCompanyId: phuongTrang.id,
        licensePlate: "51B-12345",
        name: "PT Limousine 34G",
        vehicleType: "Giuong nam",
        capacity: 34,
      },
    }),
    tb01: await prisma.vehicle.upsert({
      where: { licensePlate: "51B-67890" },
      update: {
        busCompanyId: thanhBuoi.id,
        name: "TB Cabin 34P",
        vehicleType: "Phong nam",
        capacity: 34,
        status: "active",
      },
      create: {
        busCompanyId: thanhBuoi.id,
        licensePlate: "51B-67890",
        name: "TB Cabin 34P",
        vehicleType: "Phong nam",
        capacity: 34,
      },
    }),
  };

  await ensureSeats(vehicles.ft01.id, "sleeper");
  await ensureSeats(vehicles.tb01.id, "vip");

  const routes = {
    hcmDaLat: await upsertRoute(locations.hcm.id, locations.daLat.id, {
      distanceKm: 305.5,
      estimatedMinutes: 420,
      status: "active",
    }),
    daLatHcm: await upsertRoute(locations.daLat.id, locations.hcm.id, {
      distanceKm: 305.5,
      estimatedMinutes: 420,
      status: "active",
    }),
    hcmNhaTrang: await upsertRoute(locations.hcm.id, locations.nhaTrang.id, {
      distanceKm: 430,
      estimatedMinutes: 540,
      status: "active",
    }),
    hcmCanTho: await upsertRoute(locations.hcm.id, locations.canTho.id, {
      distanceKm: 170,
      estimatedMinutes: 210,
      status: "active",
    }),
  };

  const today = new Date();
  const tripPlans = [
    [routes.hcmDaLat, vehicles.ft01, 1, 7, 30, 320000],
    [routes.hcmDaLat, vehicles.tb01, 1, 22, 0, 380000],
    [routes.hcmDaLat, vehicles.ft01, 2, 8, 0, 320000],
    [routes.daLatHcm, vehicles.tb01, 2, 13, 30, 360000],
    [routes.hcmNhaTrang, vehicles.ft01, 1, 20, 30, 420000],
    [routes.hcmNhaTrang, vehicles.ft01, 3, 21, 0, 420000],
    [routes.hcmCanTho, vehicles.tb01, 1, 9, 0, 180000],
    [routes.hcmCanTho, vehicles.tb01, 2, 16, 0, 180000],
    [routes.hcmDaLat, vehicles.ft01, 7, 7, 30, 320000],
    [routes.hcmDaLat, vehicles.tb01, 7, 22, 0, 380000],
    [routes.daLatHcm, vehicles.tb01, 8, 13, 30, 360000],
    [routes.hcmNhaTrang, vehicles.ft01, 10, 20, 30, 420000],
    [routes.hcmCanTho, vehicles.tb01, 14, 9, 0, 180000],
    [routes.hcmDaLat, vehicles.ft01, 21, 8, 0, 320000],
    [routes.hcmNhaTrang, vehicles.ft01, 21, 21, 0, 420000],
  ];

  const createdTrips = [];

  for (const [route, vehicle, dayOffset, hour, minute, price] of tripPlans) {
    const trip = await createTrip(
      route.id,
      vehicle.id,
      atTime(addDays(today, dayOffset), hour, minute),
      route.estimatedMinutes,
      price,
    );

    createdTrips.push({ route, vehicle, dayOffset, trip });
  }

  const futureDemoTrips = createdTrips.filter((item) => item.dayOffset >= 7);

  await createDemoBooking({
    bookingCode: "BKDEMOFUTURECONFIRMED",
    userId: demoPassenger.id,
    trip: futureDemoTrips[0].trip,
    passengerName: "Nguyen Van Demo",
    passengerPhone: "0900000002",
    passengerEmail: "passenger.demo@datvexe.local",
    seatCodes: ["A01", "A02"],
    status: "confirmed",
  });

  await createDemoBooking({
    bookingCode: "BKDEMOFUTUREPENDING",
    userId: demoPassenger.id,
    trip: futureDemoTrips[1].trip,
    passengerName: "Tran Thi Mau",
    passengerPhone: "0900000003",
    passengerEmail: "tranthimau@example.com",
    seatCodes: ["A03", "A04", "A05"],
    status: "pending",
  });

  await createDemoBooking({
    bookingCode: "BKDEMOFUTURECANCELLED",
    userId: demoPassenger.id,
    trip: futureDemoTrips[3].trip,
    passengerName: "Le Van Test",
    passengerPhone: "0900000004",
    passengerEmail: "levantest@example.com",
    seatCodes: ["B01"],
    status: "cancelled",
  });

  const summary = {
    users: await prisma.user.count(),
    busCompanies: await prisma.busCompany.count(),
    vehicles: await prisma.vehicle.count(),
    seats: await prisma.seat.count(),
    locations: await prisma.location.count(),
    routes: await prisma.route.count(),
    trips: await prisma.trip.count(),
  };

  console.log("Seed completed:", summary);
  console.log("Admin account: admin@datvexe.local / 123456");
  console.log("Passenger demo account: passenger.demo@datvexe.local / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
