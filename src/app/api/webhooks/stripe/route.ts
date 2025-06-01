import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, handleStripeWebhook } from '@/lib/stripe-server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { message: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  try {
    await handleStripeWebhook(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { message: 'Error handling webhook' },
      { status: 500 }
    );
  }
}
