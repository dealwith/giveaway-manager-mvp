import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { getTranslations } from "next-intl/server";

import { SubscriptionStatus } from "components/pricing/subscription-status";
import { ROUTES } from "constants/routes";
import { authOptions } from "lib/auth";

export const metadata: Metadata = {
	title: "Settings",
	description: "Manage your account settings"
};

export default async function SettingsPage() {
	const session = await getServerSession(authOptions);
	const t = await getTranslations("dashboard.settings");

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">{t("title")}</h1>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>

			<div className="grid gap-6">
				<SubscriptionStatus />
			</div>
		</div>
	);
}
