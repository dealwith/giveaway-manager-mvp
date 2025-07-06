import { GiftIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { getTranslations } from "next-intl/server";

import { GiveawayStatus } from "app-types/giveaway";
import { Button } from "components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "components/ui/card";
import { PLANS } from "constants/plans";
import { ROUTES } from "constants/routes";
import { authOptions } from "lib/auth";
import { countUserGiveaways, getUserGiveaways } from "lib/db";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Manage your Instagram giveaways"
};

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const t = await getTranslations("dashboard");

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	const giveaways = await getUserGiveaways(session.user.id);
	const giveawayCount = await countUserGiveaways(session.user.id);
	const planDetails = PLANS[session.user.subscriptionPlan];

	const activeGiveaways = giveaways.filter(
		(giveaway) => giveaway.status === GiveawayStatus.ACTIVE
	);

	const canCreateMore = giveawayCount < planDetails.giveawayLimit;

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold">{t("title")}</h1>
					<p className="text-muted-foreground">
						{t("welcome", { name: session.user.name || session.user.email })}
					</p>
				</div>

				{canCreateMore ? (
					<Link href={ROUTES.CREATE_GIVEAWAY}>
						<Button>
							<PlusIcon className="mr-2 h-4 w-4" />
							{t("createGiveawayButton")}
						</Button>
					</Link>
				) : (
					<Link href={ROUTES.PRICING}>
						<Button>{t("upgradePlanButton")}</Button>
					</Link>
				)}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("stats.totalGiveaways")}
						</CardTitle>
						<GiftIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{giveawayCount}</div>
						<p className="text-xs text-muted-foreground">
							{t("stats.remainingGiveaways", {
								count: planDetails.giveawayLimit - giveawayCount
							})}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("stats.activeGiveaways")}
						</CardTitle>
						<GiftIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeGiveaways.length}</div>
						<p className="text-xs text-muted-foreground">
							{t("stats.runningNow")}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							{t("stats.currentPlan")}
						</CardTitle>
						<SettingsIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{planDetails.name}</div>
						<p className="text-xs text-muted-foreground">
							{t("stats.giveawaysIncluded", {
								count: planDetails.giveawayLimit
							})}
						</p>
					</CardContent>
					<CardFooter>
						<Link href={ROUTES.SETTINGS} className="w-full">
							<Button variant="outline" className="w-full">
								{t("manageSubscriptionButton")}
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>

			<div className="space-y-4">
				<h2 className="text-xl font-semibold">{t("recentGiveaways.title")}</h2>

				{giveaways.length === 0 ? (
					<Card>
						<CardContent className="pt-6 pb-6 text-center">
							<p className="mb-4">{t("recentGiveaways.empty")}</p>
							<Link href={ROUTES.CREATE_GIVEAWAY}>
								<Button>{t("recentGiveaways.createFirst")}</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{giveaways.slice(0, 3).map((giveaway) => (
							<Card key={giveaway.id}>
								<CardHeader>
									<CardTitle>{giveaway.title}</CardTitle>
									<CardDescription>
										{t(`status.${giveaway.status}`)}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm">
										{t("keywordLabel")}: {giveaway.keyword}
									</p>
								</CardContent>
								<CardFooter>
									<Link
										href={ROUTES.VIEW_GIVEAWAY(giveaway.id)}
										className="w-full"
									>
										<Button variant="outline">{t("viewDetails")}</Button>
									</Link>
								</CardFooter>
							</Card>
						))}
					</div>
				)}

				{giveaways.length > 3 && (
					<div className="flex justify-center">
						<Link href={ROUTES.GIVEAWAYS}>
							<Button variant="outline">{t("viewAllGiveaways")}</Button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
