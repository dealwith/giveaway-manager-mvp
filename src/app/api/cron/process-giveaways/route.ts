import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { updateGiveaway, createGiveawayWinner } from '@/lib/db';
import { GiveawayStatus } from '@app-types/giveaway';
import { processGiveaway } from '@/lib/instagram';
import { EmailTemplates } from '@/lib/email';
import { getUser } from '@/lib/db';

// This route should be protected with a cron secret in production
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (
    process.env.NODE_ENV === 'production' &&
    (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    if (!db) {
      console.error('Error processing giveaways, database not connected');
      return NextResponse.json(
        { success: false, error: 'Failed to process giveaways' },
        { status: 500 }
      );
    }

    const startingGiveaways = query(
      collection(db, 'giveaways'),
      where('status', '==', GiveawayStatus.SCHEDULED),
      where('startTime', '<=', Timestamp.fromDate(now))
    );

    const startingSnapshot = await getDocs(startingGiveaways);

    const endingGiveaways = query(
      collection(db, 'giveaways'),
      where('status', '==', GiveawayStatus.ACTIVE),
      where('endTime', '<=', Timestamp.fromDate(now))
    );

    const endingSnapshot = await getDocs(endingGiveaways);

    // Update starting giveaways
    const startingPromises = startingSnapshot.docs.map(async (doc) => {
      const giveaway = { id: doc.id, ...doc.data() } as any;
      await updateGiveaway(doc.id, { status: GiveawayStatus.ACTIVE });

      // Send email notification
      const user = await getUser(giveaway.userId);
      if (user) {
        await EmailTemplates.GIVEAWAY_STARTED(user.email, giveaway.title, doc.id);
      }

      return {
        id: doc.id,
        title: giveaway.title,
        action: 'started',
      };
    });

    // Process ending giveaways
    const endingPromises = endingSnapshot.docs.map(async (doc) => {
      const giveaway = { id: doc.id, ...doc.data() } as any;

      // Process the giveaway to find winners
      const result = await processGiveaway(
        giveaway.postUrl,
        giveaway.keyword,
        giveaway.documentUrl
      );

      // Update giveaway status and winner count
      await updateGiveaway(doc.id, {
        status: GiveawayStatus.COMPLETED,
        winnerCount: result.winners.length,
      });

      // Save winners to database
      for (const winner of result.winners) {
        await createGiveawayWinner({
          giveawayId: doc.id,
          username: winner.username,
          commentId: winner.commentId,
          messageStatus: winner.messageStatus,
          likeStatus: winner.likeStatus,
        });
      }

      // Send email notification
      const user = await getUser(giveaway.userId);
      if (user) {
        await EmailTemplates.GIVEAWAY_COMPLETED(
          user.email,
          giveaway.title,
          doc.id,
          result.winners.length
        );
      }

      return {
        id: doc.id,
        title: giveaway.title,
        action: 'completed',
        winners: result.winners.length,
      };
    });

    const started = await Promise.all(startingPromises);
    const completed = await Promise.all(endingPromises);

    return NextResponse.json({
      success: true,
      started,
      completed,
    });
  } catch (error) {
    console.error('Error processing giveaways:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process giveaways' },
      { status: 500 }
    );
  }
}
