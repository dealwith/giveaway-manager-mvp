import { SubscriptionPlan } from "./subscription";

export interface User {
	id: string;
	email: string;
	name?: string;
	image?: string;
	subscriptionPlan?: SubscriptionPlan;
	createdAt: Date;
	updatedAt: Date;
	stripeCustomerId?: string;
	provider: "google" | "credentials";
	instagram?: {
		accessToken: string;
		businessAccountId: string;
		connectedAt: Date;
		expiresAt?: Date;
		username?: string;
	};
}
