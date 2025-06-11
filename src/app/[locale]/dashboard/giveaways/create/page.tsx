import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { GiveawayForm } from "components/giveaways/giveaway-form";
import { Alert, AlertDescription } from "components/ui/alert";
import { Button } from "components/ui/button";
import { ROUTES } from "constants/routes";
import { authOptions } from "lib/auth";
import { hasReachedGiveawayLimit } from "lib/db";

export const metadata: Metadata = {
	title: "Create Giveaway",
	description: "Create a new Instagram giveaway"
};

export default async function CreateGiveawayPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	const reachedLimit = await hasReachedGiveawayLimit(
		session.user.id,
		session.user.subscriptionPlan
	);

	if (reachedLimit) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">Create Giveaway</h1>
					<p className="text-muted-foreground">
						Set up a new Instagram giveaway
					</p>
				</div>

				<Alert variant="destructive">
					<AlertDescription>
						You have reached your giveaway limit. Please upgrade your plan to
						create more giveaways.
					</AlertDescription>
				</Alert>

				<Link href={ROUTES.PRICING}>
					<Button>Upgrade Plan</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Create Giveaway</h1>
				<p className="text-muted-foreground">Set up a new Instagram giveaway</p>
			</div>

			<GiveawayForm />
		</div>
	);
}
