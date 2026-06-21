import { prisma } from "@/lib/prisma";

export function getLocations() {
  return prisma.location.findMany({
    orderBy: [{ province: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      province: true,
      address: true,
    },
  });
}
