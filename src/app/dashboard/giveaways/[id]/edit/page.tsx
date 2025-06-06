import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { GiveawayStatus } from "app-types/giveaway";
import { GiveawayForm } from "components/giveaways/giveaway-form";
import { ROUTES } from "constants/routes";
import { authOptions } from "lib/auth";
import { getGiveaway } from "lib/db";

interface EditGiveawayPageProps {
	params: Promise<{
		id: string;
	}>;
}

export async function generateMetadata({
	params
}: EditGiveawayPageProps): Promise<Metadata> {
	const { id } = await params;
	const giveaway = await getGiveaway(id);

	if (!giveaway) {
		return {
			title: "Giveaway Not Found"
		};
	}

	return {
		title: `Edit ${giveaway.title}`,
		description: `Edit giveaway: ${giveaway.title}`
	};
}

export default async function EditGiveawayPage({
	params
}: EditGiveawayPageProps) {
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

	// Check if the giveaway is editable (only draft or scheduled)
	if (giveaway.status !== GiveawayStatus.SCHEDULED) {
		redirect(ROUTES.VIEW_GIVEAWAY(id));
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Edit Giveaway</h1>
				<p className="text-muted-foreground">Update your giveaway details</p>
			</div>

			<GiveawayForm giveaway={giveaway} />
		</div>
	);
}
