import {
	Timestamp,
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	setDoc,
	updateDoc,
	where
} from "firebase/firestore";

import { Giveaway, GiveawayStatus, GiveawayWinner } from "app-types/giveaway";
import { Subscription, SubscriptionPlan } from "app-types/subscription";
import { User } from "app-types/user";
import { db } from "config/firebase";

// User functions
export async function getUser(email: string): Promise<User | null> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const docRef = doc(db, "users", email);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) {
		return null;
	}

	const data = docSnap.data();

	return {
		id: docSnap.id,
		email: data.email,
		name: data.name,
		image: data.image,
		subscriptionPlan: data.subscriptionPlan || SubscriptionPlan.FREE,
		createdAt: data.createdAt?.toDate(),
		updatedAt: data.updatedAt?.toDate(),
		stripeCustomerId: data.stripeCustomerId,
		provider: data.provider
	};
}

export async function createUser(
	user: Omit<User, "id" | "createdAt" | "updatedAt">
): Promise<User> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const userRef = doc(db, "users", user.email);
	const now = new Date();

	const newUser: Omit<User, "id"> = {
		...user,
		createdAt: now,
		updatedAt: now
	};

	await setDoc(userRef, {
		...newUser,
		createdAt: Timestamp.fromDate(now),
		updatedAt: Timestamp.fromDate(now)
	});

	return {
		id: userRef.id,
		...newUser
	};
}

export async function updateUser(
	userId: string,
	data: Partial<User>
): Promise<void> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const userRef = doc(db, "users", userId);
	const now = new Date();

	await updateDoc(userRef, {
		...data,
		updatedAt: Timestamp.fromDate(now)
	});
}

// Subscription functions
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

// Giveaway functions
export async function getUserGiveaways(userId: string): Promise<Giveaway[]> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const q = query(
		collection(db, "giveaways"),
		where("userId", "==", userId),
		orderBy("createdAt", "desc")
	);

	const querySnapshot = await getDocs(q);

	return querySnapshot.docs.map((doc) => {
		const data = doc.data();

		return {
			id: doc.id,
			userId: data.userId,
			title: data.title,
			description: data.description,
			postUrl: data.postUrl,
			documentUrl: data.documentUrl,
			keyword: data.keyword,
			startTime: data.startTime.toDate(),
			endTime: data.endTime.toDate(),
			status: data.status,
			createdAt: data.createdAt.toDate(),
			updatedAt: data.updatedAt.toDate(),
			winnerCount: data.winnerCount
		};
	});
}

export async function getGiveaway(
	giveawayId: string
): Promise<Giveaway | null> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const docRef = doc(db, "giveaways", giveawayId);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) {
		return null;
	}

	const data = docSnap.data();

	return {
		id: docSnap.id,
		userId: data.userId,
		title: data.title,
		description: data.description,
		postUrl: data.postUrl,
		documentUrl: data.documentUrl,
		keyword: data.keyword,
		startTime: data.startTime.toDate(),
		endTime: data.endTime.toDate(),
		status: data.status,
		createdAt: data.createdAt.toDate(),
		updatedAt: data.updatedAt.toDate(),
		winnerCount: data.winnerCount
	};
}

export async function createGiveaway(
	giveaway: Omit<Giveaway, "id" | "createdAt" | "updatedAt" | "winners">
): Promise<Giveaway> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const giveawayRef = collection(db, "giveaways");
	const now = new Date();

	const giveawayWithDates = {
		...giveaway,
		status: giveaway.status || GiveawayStatus.DRAFT,
		createdAt: Timestamp.fromDate(now),
		updatedAt: Timestamp.fromDate(now),
		startTime: Timestamp.fromDate(giveaway.startTime),
		endTime: Timestamp.fromDate(giveaway.endTime)
	};

	const docRef = await addDoc(giveawayRef, giveawayWithDates);

	return {
		id: docRef.id,
		...giveaway,
		createdAt: now,
		updatedAt: now
	};
}

export async function updateGiveaway(
	giveawayId: string,
	data: Partial<Giveaway>
): Promise<void> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const giveawayRef = doc(db, "giveaways", giveawayId);
	const now = new Date();

	const dataWithDates = {
		...data,
		updatedAt: Timestamp.fromDate(now),
		startTime: data.startTime ? Timestamp.fromDate(data.startTime) : undefined,
		endTime: data.endTime ? Timestamp.fromDate(data.endTime) : undefined
	};

	await updateDoc(giveawayRef, dataWithDates);
}

export async function deleteGiveaway(giveawayId: string): Promise<void> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	await deleteDoc(doc(db, "giveaways", giveawayId));
}

// Giveaway Winners functions
export async function getGiveawayWinners(
	giveawayId: string
): Promise<GiveawayWinner[]> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const q = query(
		collection(db, "giveaway-winners"),
		where("giveawayId", "==", giveawayId),
		orderBy("createdAt", "desc")
	);

	const querySnapshot = await getDocs(q);

	return querySnapshot.docs.map((doc) => {
		const data = doc.data();

		return {
			id: doc.id,
			giveawayId: data.giveawayId,
			username: data.username,
			commentId: data.commentId,
			messageStatus: data.messageStatus,
			likeStatus: data.likeStatus,
			createdAt: data.createdAt.toDate()
		};
	});
}

export async function createGiveawayWinner(
	winner: Omit<GiveawayWinner, "id" | "createdAt">
): Promise<GiveawayWinner> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const winnerRef = collection(db, "giveaway-winners");
	const now = new Date();

	const winnerWithDate = {
		...winner,
		createdAt: Timestamp.fromDate(now)
	};

	const docRef = await addDoc(winnerRef, winnerWithDate);

	return {
		id: docRef.id,
		...winner,
		createdAt: now
	};
}

export async function updateGiveawayWinner(
	winnerId: string,
	data: Partial<GiveawayWinner>
): Promise<void> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const winnerRef = doc(db, "giveaway-winners", winnerId);
	await updateDoc(winnerRef, data);
}

// Count functions
export async function countUserGiveaways(userId: string): Promise<number> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const q = query(collection(db, "giveaways"), where("userId", "==", userId));
	const snapshot = await getDocs(q);

	return snapshot.size;
}

export async function hasReachedGiveawayLimit(
	userId: string,
	plan: SubscriptionPlan
): Promise<boolean> {
	const count = await countUserGiveaways(userId);
	const { PLANS } = await import("constants/plans");
	const limit = PLANS[plan].giveawayLimit;

	return count >= limit;
}
