import {
	Timestamp,
	addDoc,
	collection,
	doc,
	getDocs,
	limit,
	query,
	updateDoc,
	where
} from "firebase/firestore";

import { Subscription } from "app-types/subscription";
import { db } from "config/firebase";

export async function getUserSubscription(
	userId: string
): Promise<Subscription | null> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const q = query(
		collection(db, "subscriptions"),
		where("userId", "==", userId),
		where("status", "==", "active"),
		limit(1)
	);
	const querySnapshot = await getDocs(q);

	if (querySnapshot.empty) {
		return null;
	}

	const data = querySnapshot.docs[0].data();

	return {
		id: querySnapshot.docs[0].id,
		userId: data.userId,
		status: data.status,
		plan: data.plan,
		priceId: data.priceId,
		quantity: data.quantity,
		cancelAtPeriodEnd: data.cancelAtPeriodEnd,
		createdAt: data.createdAt?.toDate(),
		currentPeriodStart: data.currentPeriodStart?.toDate(),
		currentPeriodEnd: data.currentPeriodEnd?.toDate(),
		endedAt: data.endedAt?.toDate(),
		canceledAt: data.canceledAt?.toDate(),
		trialStart: data.trialStart?.toDate(),
		trialEnd: data.trialEnd?.toDate()
	};
}

export async function createSubscription(
	subscription: Omit<Subscription, "id">
): Promise<Subscription> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const subscriptionRef = collection(db, "subscriptions");
	const now = new Date();

	const subscriptionWithDates = {
		...subscription,
		createdAt: Timestamp.fromDate(now),
		currentPeriodStart: Timestamp.fromDate(subscription.currentPeriodStart),
		currentPeriodEnd: Timestamp.fromDate(subscription.currentPeriodEnd),
		endedAt: subscription.endedAt
			? Timestamp.fromDate(subscription.endedAt)
			: null,
		canceledAt: subscription.canceledAt
			? Timestamp.fromDate(subscription.canceledAt)
			: null,
		trialStart: subscription.trialStart
			? Timestamp.fromDate(subscription.trialStart)
			: null,
		trialEnd: subscription.trialEnd
			? Timestamp.fromDate(subscription.trialEnd)
			: null
	};

	const docRef = await addDoc(subscriptionRef, subscriptionWithDates);

	return {
		id: docRef.id,
		...subscription
	};
}

export async function updateSubscription(
	subscriptionId: string,
	data: Partial<Subscription>
): Promise<void> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const subscriptionRef = doc(db, "subscriptions", subscriptionId);

	const dataWithDates = {
		...data,
		updatedAt: Timestamp.fromDate(new Date()),
		currentPeriodStart: data.currentPeriodStart
			? Timestamp.fromDate(data.currentPeriodStart)
			: undefined,
		currentPeriodEnd: data.currentPeriodEnd
			? Timestamp.fromDate(data.currentPeriodEnd)
			: undefined,
		endedAt: data.endedAt ? Timestamp.fromDate(data.endedAt) : undefined,
		canceledAt: data.canceledAt
			? Timestamp.fromDate(data.canceledAt)
			: undefined,
		trialStart: data.trialStart
			? Timestamp.fromDate(data.trialStart)
			: undefined,
		trialEnd: data.trialEnd ? Timestamp.fromDate(data.trialEnd) : undefined
	};

	await updateDoc(subscriptionRef, dataWithDates);
}
