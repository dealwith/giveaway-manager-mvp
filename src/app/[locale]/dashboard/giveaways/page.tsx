import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { getTranslations } from "next-intl/server";

import { GiveawayList } from "components/giveaways/giveaway-list";
import { ROUTES } from "constants/routes";
import { authOptions } from "lib/auth";
import { countUserGiveaways, getUserGiveaways } from "lib/db";

export const metadata: Metadata = {
	title: "Giveaways",
	description: "Manage your Instagram giveaways"
};

export default async function GiveawaysPage() {
	const session = await getServerSession(authOptions);
	const t = await getTranslations("dashboard.giveaways");

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	const giveaways = await getUserGiveaways(session.user.id);
	const giveawayCount = await countUserGiveaways(session.user.id);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">{t("title")}</h1>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>

			<GiveawayList
				giveaways={giveaways}
				giveawayCount={giveawayCount}
				userSubscriptionPlan={session.user.subscriptionPlan}
			/>
		</div>
	);
}
