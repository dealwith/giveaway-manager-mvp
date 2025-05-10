import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getGiveaway, getGiveawayWinners, createGiveawayWinner } from '@/lib/db';
import { ApiResponse } from '@/types/api';
import { processGiveaway } from '@/lib/instagram';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const giveaway = await getGiveaway(params.id);

    if (!giveaway) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Giveaway not found' },
        { status: 404 }
      );
    }

    // Check if the giveaway belongs to the current user
    if (giveaway.userId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const winners = await getGiveawayWinners(params.id);
    return NextResponse.json<ApiResponse>({ success: true, data: winners });
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const giveaway = await getGiveaway(params.id);

    if (!giveaway) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Giveaway not found' },
        { status: 404 }
      );
    }

    // Check if the giveaway belongs to the current user
    if (giveaway.userId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Process the giveaway to find winners
    const result = await processGiveaway(
      giveaway.postUrl,
      giveaway.keyword,
      giveaway.documentUrl
    );

    // Save winners to database
    const savedWinners = [];
    for (const winner of result.winners) {
      const savedWinner = await createGiveawayWinner({
        giveawayId: params.id,
        username: winner.username,
        commentId: winner.commentId,
        messageStatus: winner.messageStatus,
        likeStatus: winner.likeStatus,
      });
      savedWinners.push(savedWinner);
    }

    // Update giveaway with winner count
    await updateGiveaway(params.id, {
      winnerCount: result.winners.length,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        winners: savedWinners,
        totalComments: result.totalComments,
      }
    });
  } catch (error) {
    console.error('Error processing giveaway:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to process giveaway' },
      { status: 500 }
    );
  }
}
