import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import { getGiveaway, getGiveawayWinners } from '@/lib/db';
import { GiveawayDetail } from '@/components/giveaways/giveaway-detail';

interface GiveawayDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: GiveawayDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const giveaway = await getGiveaway(id);

  if (!giveaway) {
    return {
      title: 'Giveaway Not Found',
    };
  }

  return {
    title: giveaway.title,
    description: `Details for giveaway: ${giveaway.title}`,
  };
}

export default async function GiveawayDetailPage({
  params,
}: GiveawayDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  const { id } = await params;
  const giveaway = await getGiveaway(id);

  if (!giveaway) {
    notFound();
  }

  // Check if the giveaway belongs to the current user
  if (giveaway.userId !== session.user.id) {
    redirect(ROUTES.GIVEAWAYS);
  }

  const winners = await getGiveawayWinners(id);

  return (
    <div className="space-y-6">
      <GiveawayDetail giveaway={giveaway} winners={winners} />
    </div>
  );
}
