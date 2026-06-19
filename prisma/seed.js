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
  ];

  for (const [route, vehicle, dayOffset, hour, minute, price] of tripPlans) {
    await createTrip(
      route.id,
      vehicle.id,
      atTime(addDays(today, dayOffset), hour, minute),
      route.estimatedMinutes,
      price,
    );
  }

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
