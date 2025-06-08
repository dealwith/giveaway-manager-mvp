import {
	Timestamp,
	addDoc,
	collection,
	doc,
	getDocs,
	query,
	updateDoc,
	where
} from "firebase/firestore";

import { GiveawayWinner } from "app-types/giveaway";
import { db } from "config/firebase";

export async function getGiveawayWinners(
	giveawayId: string
): Promise<GiveawayWinner[]> {
	if (!db) {
		throw new Error("Firebase database not initialized");
	}

	const q = query(
		collection(db, "giveaway-winners"),
		where("giveawayId", "==", giveawayId)
	);

	const querySnapshot = await getDocs(q);
	const winners = querySnapshot.docs.map((doc) => {
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

	// Sort by createdAt in JavaScript instead of Firestore
	return winners.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
