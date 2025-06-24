import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { getTranslations } from "next-intl/server";

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
	const t = await getTranslations("dashboard.createGiveaway");

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
					<h1 className="text-2xl font-bold">{t("title")}</h1>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>

				<Alert variant="destructive">
					<AlertDescription>{t("limit.reached")}</AlertDescription>
				</Alert>

				<Link href={ROUTES.PRICING}>
					<Button>{t("limit.upgradeButton")}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">{t("title")}</h1>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>

			<GiveawayForm />
		</div>
	);
}
