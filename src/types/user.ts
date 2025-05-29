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
}
