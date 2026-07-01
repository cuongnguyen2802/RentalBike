import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent bike rental rates. No hidden fees.",
};

const rates = [
  {
    type: "City Bike",
    icon: "🚲",
    hourly: 5,
    daily: 25,
    features: ["Basket included", "Lock provided", "Bell & lights"],
  },
  {
    type: "Mountain Bike",
    icon: "🏔️",
    hourly: 8,
    daily: 40,
    features: ["21-speed gears", "Front suspension", "Water bottle cage"],
    popular: true,
  },
  {
    type: "Electric Bike",
    icon: "⚡",
    hourly: 12,
    daily: 55,
    features: ["Up to 60km range", "Phone holder", "USB charging port"],
  },
  {
    type: "Kids Bike",
    icon: "🧒",
    hourly: 4,
    daily: 18,
    features: ["Adjustable seat", "Training wheels available", "Safety pads"],
  },
];

export default function PricingPage() {
  return (
    <div>
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Choose hourly or daily rates. A 30% deposit secures your booking —
            pay the rest when you return the bike.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rates.map((rate) => (
              <div
                key={rate.type}
                className={`rounded-2xl border-2 p-6 relative ${
                  rate.popular
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                {rate.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-4xl mb-3">{rate.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{rate.type}</h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">${rate.hourly}</span>
                    <span className="text-gray-500 text-sm">/hour</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold text-emerald-600">${rate.daily}</span>
                    <span className="text-gray-500 text-sm">/day</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {rate.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={rate.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href={`/bikes?type=${rate.type.toLowerCase().replace(" ", "_")}`}>
                    Book Now
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-gray-50 border border-gray-100 p-8 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-4">What&apos;s included in every rental</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Helmet (free at station)",
                "Basic repair kit",
                "24/7 support",
                "Insurance coverage",
                "Lock & key",
                "Station map",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
