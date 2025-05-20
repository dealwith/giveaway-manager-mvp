import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ROUTES } from "@/constants/routes";
import { GiveawayForm } from "@/components/giveaways/giveaway-form";
import { hasReachedGiveawayLimit } from "@/lib/db";
import { Alert, AlertDescription } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Create Giveaway",
	description: "Create a new Instagram giveaway",
};

export default async function CreateGiveawayPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	const reachedLimit = await hasReachedGiveawayLimit(
		session.user.id,
		session.user.plan
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
