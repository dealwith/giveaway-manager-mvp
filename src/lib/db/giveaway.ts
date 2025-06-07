import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Giveaway, GiveawayStatus } from '@app-types/giveaway';
import { SubscriptionPlan } from '@app-types/subscription';

export async function getUserGiveaways(userId: string): Promise<Giveaway[]> {
  if (!db) {
    throw new Error('Firebase database not initialized');
  }
  const q = query(
    collection(db, 'giveaways'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
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
      winnerCount: data.winnerCount,
    };
  });
}

export async function getGiveaway(giveawayId: string): Promise<Giveaway | null> {
  if (!db) {
    throw new Error('Firebase database not initialized');
  }
  const docRef = doc(db, 'giveaways', giveawayId);
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
    winnerCount: data.winnerCount,
  };
}

export async function createGiveaway(giveaway: Omit<Giveaway, 'id' | 'createdAt' | 'updatedAt' | 'winners'>): Promise<Giveaway> {
  if (!db) {
    throw new Error('Firebase database not initialized');
  }
  const giveawayRef = collection(db, 'giveaways');
  const now = new Date();

  const giveawayWithDates = {
    ...giveaway,
    status: giveaway.status || GiveawayStatus.DRAFT,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
    startTime: Timestamp.fromDate(giveaway.startTime),
    endTime: Timestamp.fromDate(giveaway.endTime),
  };

  const docRef = await addDoc(giveawayRef, giveawayWithDates);

  return {
    id: docRef.id,
    ...giveaway,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateGiveaway(giveawayId: string, data: Partial<Giveaway>): Promise<void> {
  if (!db) {
    throw new Error('Firebase database not initialized');
  }
  const giveawayRef = doc(db, 'giveaways', giveawayId);
  const now = new Date();

  const dataWithDates = {
    ...data,
    updatedAt: Timestamp.fromDate(now),
    startTime: data.startTime ? Timestamp.fromDate(data.startTime) : undefined,
    endTime: data.endTime ? Timestamp.fromDate(data.endTime) : undefined,
  };

  await updateDoc(giveawayRef, dataWithDates);
}

export async function deleteGiveaway(giveawayId: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase database not initialized');
  }
  await deleteDoc(doc(db, 'giveaways', giveawayId));
}

export async function countUserGiveaways(userId: string): Promise<number> {
  if (!db) {
    throw new Error('Firebase database not initialized');
  }
  const q = query(collection(db, 'giveaways'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function hasReachedGiveawayLimit(userId: string, plan: SubscriptionPlan): Promise<boolean> {
  const count = await countUserGiveaways(userId);
  const { PLANS } = await import('@/constants/plans');
  const limit = PLANS[plan].giveawayLimit;

  return count >= limit;
}