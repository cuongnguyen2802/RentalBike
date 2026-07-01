import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const bookingId = pi.metadata?.bookingId;
      if (!bookingId) break;

      await prisma.$transaction([
        prisma.payment.upsert({
          where: { id: pi.id },
          update: { status: "SUCCEEDED" },
          create: {
            id: pi.id,
            bookingId,
            provider: "stripe",
            amount: pi.amount / 100,
            currency: pi.currency,
            status: "SUCCEEDED",
            stripePaymentIntentId: pi.id,
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED", depositPaid: true },
        }),
      ]);
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      const bookingId = pi.metadata?.bookingId;
      if (!bookingId) break;

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
