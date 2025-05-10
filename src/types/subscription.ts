export enum SubscriptionPlan {
	FREE = 'free',
	PRO = 'pro',
}

export enum SubscriptionStatus {
	ACTIVE = 'active',
	CANCELED = 'canceled',
	PAST_DUE = 'past_due',
	INCOMPLETE = 'incomplete',
	INCOMPLETE_EXPIRED = 'incomplete_expired',
	TRIALING = 'trialing',
	UNPAID = 'unpaid',
}

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  priceId: string;
  quantity: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  endedAt?: Date;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;

  createdAt: Date;
}


