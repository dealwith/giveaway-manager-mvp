import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { SubscriptionStatus } from "components/pricing/subscription-status";
import { ROUTES } from "constants/routes";
import { authOptions } from "lib/auth";

export const metadata: Metadata = {
	title: "Settings",
	description: "Manage your account settings"
};

export default async function SettingsPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account and subscription
				</p>
			</div>

			<div className="grid gap-6">
				<SubscriptionStatus />
			</div>
		</div>
	);
}
