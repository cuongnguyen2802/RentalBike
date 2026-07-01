import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, CalendarCheck, CreditCard, Bike, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how to rent a bike with PedalGo in 4 simple steps.",
};

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Browse & Filter",
    description:
      "Explore our fleet by type, station, and price. Each bike shows live availability so you know exactly what's free.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Pick Your Time",
    description:
      "Select your pickup date and time. Our real-time calendar shows available slots — book by the hour or by the day.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Pay a Deposit",
    description:
      "Secure your booking with a 30% deposit via Stripe. Your spot is instantly confirmed and locked in.",
  },
  {
    number: "04",
    icon: Bike,
    title: "Pick Up & Ride",
    description:
      "Show your booking confirmation at the station, grab your bike, and enjoy the ride. Return it when you're done.",
  },
];

const faqs = [
  {
    q: "Can I cancel my booking?",
    a: "Yes — cancellations made more than 24 hours before your rental start time receive a full refund of the deposit.",
  },
  {
    q: "What happens if I'm late returning the bike?",
    a: "You'll be charged for the extra time at the standard hourly rate. Staff will contact you if you're significantly overdue.",
  },
  {
    q: "Is a helmet included?",
    a: "Helmets are available free of charge at all stations — just ask the staff when you pick up your bike.",
  },
  {
    q: "Can I extend my rental?",
    a: "Yes! Log into your account and extend your booking if the bike is still available for the extra time.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Renting a bike with PedalGo takes less than 2 minutes. Here&apos;s how:
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gray-200 z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-5xl font-bold text-emerald-100 mb-2">{step.number}</div>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 mb-4">
                    <step.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/bikes">
                Start Browsing <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl bg-white border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
