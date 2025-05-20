import Stripe from "stripe";
import { db } from '@/config/firebase';
import { getUser, getUserSubscription, updateSubscription, createSubscription } from '@/lib/db';
import { SubscriptionPlan } from '@app-types/subscription';
import { doc, updateDoc } from 'firebase/firestore';

interface CreateCheckoutSessionOptions {
  userId: string;
  priceId: string;
  returnUrl: string;
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession({
  userId,
  priceId,
  returnUrl
}: CreateCheckoutSessionOptions) {
  try {
    const user = await getUser(userId);

    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await updateDoc(doc(db, 'users', userId), {
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId,
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Cancels a user's subscription
 */
export async function cancelSubscription(userId: string) {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Update subscription in database
    await updateSubscription(subscription.id, {
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Handles a webhook event from Stripe
 */
export async function handleStripeWebhook(event: any) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId;

      if (!userId) {
        throw new Error('No userId in session metadata');
      }

      // Get subscription from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      // Create or update subscription in database
      const subscriptionData = {
        userId,
        status: stripeSubscription.status,
        plan: SubscriptionPlan.PRO,
        priceId: stripeSubscription.items.data[0].price.id,
        quantity: stripeSubscription.items.data[0].quantity,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        createdAt: new Date(stripeSubscription.created * 1000),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        endedAt: stripeSubscription.ended_at
          ? new Date(stripeSubscription.ended_at * 1000)
          : undefined,
        canceledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : undefined,
        trialStart: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : undefined,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : undefined,
      };

      await createSubscription(subscriptionData);

      break;
    }

    case 'customer.subscription.updated': {
      const stripeSubscription = event.data.object;
      let userId = stripeSubscription.metadata.userId;

      if (!userId) {
        // Try to get userId from customer metadata
        const customer = await stripe.customers.retrieve(
          stripeSubscription.customer as string
        );

        if (customer.deleted) {
          throw new Error('Customer deleted');
        }

        userId = customer.metadata.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }
      }

      // Find subscription in database
      const subscription = await getUserSubscription(userId);

      if (subscription) {
        // Update subscription in database
        await updateSubscription(subscription.id, {
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          endedAt: stripeSubscription.ended_at
            ? new Date(stripeSubscription.ended_at * 1000)
            : undefined,
          canceledAt: stripeSubscription.canceled_at
            ? new Date(stripeSubscription.canceled_at * 1000)
            : undefined,
        });
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const stripeSubscription = event.data.object;
      let userId = stripeSubscription.metadata.userId;

      if (!userId) {
        // Try to get userId from customer metadata
        const customer = await stripe.customers.retrieve(
          stripeSubscription.customer as string
        );

        if (customer.deleted) {
          throw new Error('Customer deleted');
        }

        userId = customer.metadata.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }
      }

      // Find subscription in database
      const subscription = await getUserSubscription(userId);

      if (subscription) {
        // Update subscription in database
        await updateSubscription(subscription.id, {
          status: 'canceled',
          cancelAtPeriodEnd: false,
          endedAt: new Date(),
        });
      }

      break;
    }
  }
}
