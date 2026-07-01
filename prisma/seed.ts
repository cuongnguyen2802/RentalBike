import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Dev admin user
  await prisma.user.upsert({
    where:  { email: "dev@pedalgo.local" },
    update: { role: "ADMIN", name: "Dev Admin" },
    create: {
      email:      "dev@pedalgo.local",
      supabaseId: "dev-local",
      name:       "Dev Admin",
      role:       "ADMIN",
    },
  });
  console.log("Dev admin user seeded.");

  // Stations
  const [dist1, dist3, tbd] = await Promise.all([
    prisma.station.upsert({
      where: { id: "station-dist1" },
      update: {},
      create: {
        id: "station-dist1",
        name: "District 1 — Ben Thanh",
        address: "1 Le Loi, Ben Thanh Ward, District 1, Ho Chi Minh City",
        lat: 10.7726,
        lng: 106.6983,
        phone: "+84 28 1234 5678",
        openingHours: { weekday: "07:00-20:00", weekend: "08:00-18:00" },
      },
    }),
    prisma.station.upsert({
      where: { id: "station-dist3" },
      update: {},
      create: {
        id: "station-dist3",
        name: "District 3 — Vo Thi Sau",
        address: "45 Vo Thi Sau, District 3, Ho Chi Minh City",
        lat: 10.7826,
        lng: 106.6893,
        phone: "+84 28 9876 5432",
        openingHours: { weekday: "07:30-19:30", weekend: "08:00-17:00" },
      },
    }),
    prisma.station.upsert({
      where: { id: "station-thuduc" },
      update: {},
      create: {
        id: "station-thuduc",
        name: "Thu Duc City — Linh Xuan",
        address: "88 Nguyen Van Cu, Linh Xuan, Thu Duc",
        lat: 10.8507,
        lng: 106.7527,
        openingHours: { weekday: "08:00-18:00", weekend: "08:00-16:00" },
      },
    }),
  ]);

  console.log("Stations seeded:", [dist1.name, dist3.name, tbd.name]);

  // Bikes
  const bikes = [
    // District 1
    { model: "Trek FX 1", type: "CITY" as const, stationId: dist1.id, hourlyRate: 5, dailyRate: 25, features: ["Basket", "Lock", "Bell"] },
    { model: "Trek FX 2", type: "CITY" as const, stationId: dist1.id, hourlyRate: 5, dailyRate: 25, features: ["Basket", "Lock", "Bell"] },
    { model: "Giant Escape 3", type: "CITY" as const, stationId: dist1.id, hourlyRate: 6, dailyRate: 28, features: ["7-speed", "Lights", "Lock"] },
    { model: "Specialized Turbo Como SL", type: "ELECTRIC" as const, stationId: dist1.id, hourlyRate: 15, dailyRate: 65, description: "Smooth electric assist, up to 80km range", features: ["E-Assist", "USB Port", "App Connected"] },
    { model: "Strider 14x", type: "KIDS" as const, stationId: dist1.id, hourlyRate: 3, dailyRate: 15, features: ["Balance Bike", "Adjustable", "Safety Pads"] },

    // District 3
    { model: "Trek Marlin 5", type: "MOUNTAIN" as const, stationId: dist3.id, hourlyRate: 8, dailyRate: 38, features: ["21-speed", "Front Suspension", "Disc Brakes"] },
    { model: "Trek Marlin 6", type: "MOUNTAIN" as const, stationId: dist3.id, hourlyRate: 9, dailyRate: 42, features: ["21-speed", "Full Suspension", "Hydraulic Brakes"] },
    { model: "Giant Contend AR 4", type: "ROAD" as const, stationId: dist3.id, hourlyRate: 10, dailyRate: 45, features: ["Shimano 105", "Aero Frame", "Drop Bars"] },
    { model: "Giant Talon 3", type: "CITY" as const, stationId: dist3.id, hourlyRate: 5, dailyRate: 24, features: ["Basket", "Fenders", "Lock"] },

    // Thu Duc
    { model: "Trek Powerfly 4", type: "ELECTRIC" as const, stationId: tbd.id, hourlyRate: 14, dailyRate: 60, description: "Mountain electric bike — conquer any trail", features: ["Bosch Motor", "625Wh Battery", "Shimano Deore"] },
    { model: "Giant STP 24", type: "KIDS" as const, stationId: tbd.id, hourlyRate: 4, dailyRate: 18, features: ["24-inch", "7-speed", "Safety Kit"] },
    { model: "Cannondale Trail 8", type: "MOUNTAIN" as const, stationId: tbd.id, hourlyRate: 8, dailyRate: 36, features: ["21-speed", "Suspension Fork"] },
  ];

  for (const bike of bikes) {
    await prisma.bike.create({ data: { ...bike, status: "AVAILABLE" } });
  }

  console.log(`Seeded ${bikes.length} bikes.`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
