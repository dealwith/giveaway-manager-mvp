import "next-auth";
import { SubscriptionPlan } from "./subscription";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			email: string;
			name: string | null;
			image: string;
			subscriptionPlan: SubscriptionPlan;
			provider: "google" | "credentials";
			instagram?: {
				accessToken: string;
				businessAccountId: string;
				connectedAt: Date;
				expiresAt?: Date;
				username?: string;
			};
		};
	}

	interface User {
		id: string;
		name?: string | null;
		email: string;
		image?: string | null;
		plan: SubscriptionPlan;
		instagram?: {
			accessToken: string;
			businessAccountId: string;
			connectedAt: Date;
			expiresAt?: Date;
			username?: string;
		};
	}
}
