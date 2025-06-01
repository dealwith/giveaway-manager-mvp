import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ApiResponse } from '@app-types/api';
import { cancelSubscription } from '@/lib/stripe-server';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await cancelSubscription(session.user.id);
    return NextResponse.json<ApiResponse>({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
