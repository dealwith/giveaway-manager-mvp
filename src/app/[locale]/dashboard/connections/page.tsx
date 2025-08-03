import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ConnectInstagram } from "components/instagram/connect-instagram";
import { ROUTES } from "constants/routes";
import { getSession } from "lib/auth";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("dashboard.connections");

	return {
		title: t("title")
	};
}

export default async function ConnectionsPage() {
	const session = await getSession();

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	const t = await getTranslations("dashboard.connections");

	return (
		<div className="container max-w-6xl py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">{t("title")}</h1>
				<p className="text-muted-foreground mt-2">{t("description")}</p>
			</div>

			<div className="space-y-6">
				<section>
					<h2 className="text-xl font-semibold mb-4">
						{t("socialMedia.title")}
					</h2>
					<div className="grid gap-6 md:grid-cols-2">
						<ConnectInstagram />
					</div>
				</section>

				<section className="mt-8 p-4 border rounded-lg bg-muted/30">
					<h3 className="text-lg font-medium mb-2">{t("comingSoon.title")}</h3>
					<p className="text-sm text-muted-foreground">
						{t("comingSoon.description")}
					</p>
					<ul className="mt-3 space-y-1 text-sm text-muted-foreground">
						<li>• Twitter/X</li>
						<li>• Facebook</li>
						<li>• TikTok</li>
						<li>• Discord</li>
					</ul>
				</section>
			</div>
		</div>
	);
}
