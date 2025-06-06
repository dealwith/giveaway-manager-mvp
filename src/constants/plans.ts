import { SubscriptionPlan } from "app-types/subscription";

export const PLANS = {
	[SubscriptionPlan.FREE]: {
		name: "Free",
		description: "Get started with 1 free giveaway",
		price: 0,
		features: ["1 giveaway", "Basic analytics", "Email support"],
		giveawayLimit: 1
	},
	[SubscriptionPlan.PRO]: {
		name: "Pro",
		description: "Everything you need for running multiple giveaways",
		price: 10,
		features: [
			"10 giveaways",
			"Advanced analytics",
			"Priority support",
			"Custom keywords",
			"Unlimited winners"
		],
		giveawayLimit: 10,
		stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || ""
	}
};
