import {
	Timestamp,
	deleteField,
	doc,
	getDoc,
	setDoc,
	updateDoc
} from "firebase/firestore";

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
		provider: data.provider || "credentials",
		instagram: data.instagram
			? {
					accessToken: data.instagram.accessToken,
					businessAccountId: data.instagram.businessAccountId,
					connectedAt: data.instagram.connectedAt?.toDate(),
					expiresAt: data.instagram.expiresAt?.toDate(),
					username: data.instagram.username
				}
			: undefined
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

	const updateData: Record<string, any> = {
		...data,
		updatedAt: Timestamp.fromDate(now)
	};

	// Handle Instagram data conversion for Firestore
	if (data.instagram) {
		updateData.instagram = {
			...data.instagram,
			connectedAt: data.instagram.connectedAt
				? Timestamp.fromDate(data.instagram.connectedAt)
				: undefined,
			expiresAt: data.instagram.expiresAt
				? Timestamp.fromDate(data.instagram.expiresAt)
				: undefined
		};
	}

	await updateDoc(userRef, updateData);
}

export async function updateUserInstagramCredentials(
	userId: string,
	instagram: {
		accessToken: string;
		businessAccountId: string;
		username?: string;
		expiresAt?: Date;
	}
): Promise<void> {
	await updateUser(userId, {
		instagram: {
			...instagram,
			connectedAt: new Date()
		}
	});
}

export async function removeUserInstagramCredentials(
	userId: string
): Promise<void> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const userRef = doc(db, "users", userId);
	const now = new Date();

	await updateDoc(userRef, {
		instagram: deleteField(),
		updatedAt: Timestamp.fromDate(now)
	});
}
