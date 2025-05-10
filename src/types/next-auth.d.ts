import 'next-auth';
import { SubscriptionPlan } from './subscription';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			email: string;
			name: string | null;
			image: string;
			subscriptionPlan: SubscriptionPlan;
		};
	}

	interface User {
		id: string;
		name?: string | null;
		email: string;
		image?: string | null;
		plan: SubscriptionPlan;
	}
}