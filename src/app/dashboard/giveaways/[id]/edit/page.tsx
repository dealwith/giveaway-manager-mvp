import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import { getGiveaway } from '@/lib/db';
import { GiveawayForm } from '@/components/giveaways/giveaway-form';
import { GiveawayStatus } from '@app-types/giveaway';

interface EditGiveawayPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EditGiveawayPageProps): Promise<Metadata> {
  const giveaway = await getGiveaway(params.id);

  if (!giveaway) {
    return {
      title: 'Giveaway Not Found',
    };
  }

  return {
    title: `Edit ${giveaway.title}`,
    description: `Edit giveaway: ${giveaway.title}`,
  };
}

export default async function EditGiveawayPage({
  params,
}: EditGiveawayPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  const giveaway = await getGiveaway(params.id);

  if (!giveaway) {
    notFound();
  }

  // Check if the giveaway belongs to the current user
  if (giveaway.userId !== session.user.id) {
    redirect(ROUTES.GIVEAWAYS);
  }

  // Check if the giveaway is editable (only draft or scheduled)
  if (giveaway.status !== GiveawayStatus.SCHEDULED) {
    redirect(ROUTES.VIEW_GIVEAWAY(params.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Giveaway</h1>
        <p className="text-muted-foreground">
          Update your giveaway details
        </p>
      </div>

      <GiveawayForm giveaway={giveaway} />
    </div>
  );
}
