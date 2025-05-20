export interface User {
	id: string;
	email: string;
	name?: string;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
	stripeCustomerId?: string;
}
