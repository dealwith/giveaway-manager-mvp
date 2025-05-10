import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@constants/routes';
import { getUserGiveaways, countUserGiveaways } from '@/lib/db';
import { GiveawayList } from '@/components/giveaways/giveaway-list';

export const metadata: Metadata = {
  title: 'Giveaways',
  description: 'Manage your Instagram giveaways',
};

export default async function GiveawaysPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  const giveaways = await getUserGiveaways(session.user.id);
  const giveawayCount = await countUserGiveaways(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Giveaways</h1>
        <p className="text-muted-foreground">
          Manage your Instagram giveaways
        </p>
      </div>

      <GiveawayList giveaways={giveaways} giveawayCount={giveawayCount} />
    </div>
  );
}
