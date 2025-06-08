import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { SubscriptionPlan } from "app-types/subscription";
import { User } from "app-types/user";
import { db } from "config/firebase";

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
