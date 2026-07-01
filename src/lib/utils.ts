import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDatetime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function calcRentalPrice(
  hourlyRate: number,
  dailyRate: number,
  startTime: Date,
  endTime: Date
) {
  const ms = endTime.getTime() - startTime.getTime();
  const hours = ms / (1000 * 60 * 60);
  if (hours >= 24) {
    const days = Math.ceil(hours / 24);
    return { total: days * dailyRate, days, hours: 0 };
  }
  return { total: hours * hourlyRate, days: 0, hours };
}

export function getBikeTypeLabel(type: string) {
  const labels: Record<string, string> = {
    CITY: "City Bike",
    MOUNTAIN: "Mountain Bike",
    ELECTRIC: "Electric Bike",
    KIDS: "Kids Bike",
    ROAD: "Road Bike",
  };
  return labels[type] ?? type;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    AVAILABLE: "text-green-600 bg-green-50",
    RENTED: "text-blue-600 bg-blue-50",
    MAINTENANCE: "text-yellow-600 bg-yellow-50",
    PENDING: "text-yellow-600 bg-yellow-50",
    CONFIRMED: "text-blue-600 bg-blue-50",
    ACTIVE: "text-green-600 bg-green-50",
    COMPLETED: "text-gray-600 bg-gray-50",
    CANCELLED: "text-red-600 bg-red-50",
  };
  return colors[status] ?? "text-gray-600 bg-gray-50";
}
