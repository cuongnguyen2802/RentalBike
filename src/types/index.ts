import type { Bike, Station, Booking, User, Payment } from "@prisma/client";

export type BikeWithStation = Bike & { station: Station };
export type BookingWithBike = Booking & { bike: BikeWithStation };
export type BookingWithDetails = Booking & {
  bike: BikeWithStation;
  user: User;
  payments: Payment[];
};

export type TimeSlot = {
  startTime: Date;
  endTime: Date;
  available: boolean;
};

export type PriceBreakdown = {
  hours: number;
  days: number;
  hourlyRate: number;
  dailyRate: number;
  total: number;
  depositAmount: number;
};
