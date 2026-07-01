import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export const DEPOSIT_PERCENT = 0.3;

export async function createDepositPaymentIntent(
  bookingId: string,
  totalPrice: number,
  currency = "usd"
) {
  const stripe = getStripe();
  const depositAmount = Math.round(totalPrice * DEPOSIT_PERCENT * 100);

  return stripe.paymentIntents.create({
    amount: depositAmount,
    currency,
    metadata: { bookingId, type: "deposit" },
    automatic_payment_methods: { enabled: true },
  });
}
