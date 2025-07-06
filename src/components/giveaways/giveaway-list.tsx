"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Giveaway, GiveawayStatus } from "app-types/giveaway";
import { SubscriptionPlan } from "app-types/subscription";
import { Button } from "components/ui/button";
import { PLANS } from "constants/plans";
import { ROUTES } from "constants/routes";

import { GiveawayCard } from "./giveaway-card";

interface GiveawayListProps {
	giveaways: Giveaway[];
	giveawayCount: number;
	userSubscriptionPlan?: SubscriptionPlan;
}

export function GiveawayList({
	giveaways,
	giveawayCount,
	userSubscriptionPlan
}: GiveawayListProps) {
	const t = useTranslations("dashboard.giveaways.list");

	const { active, scheduled, completed, other } = useMemo(() => {
		const active = giveaways.filter(
			(giveaway) => giveaway.status === GiveawayStatus.ACTIVE
		);

		const scheduled = giveaways.filter(
			(giveaway) => giveaway.status === GiveawayStatus.SCHEDULED
		);

		const completed = giveaways.filter(
			(giveaway) => giveaway.status === GiveawayStatus.COMPLETED
		);

		const other = giveaways.filter(
			(giveaway) =>
				giveaway.status !== GiveawayStatus.ACTIVE &&
				giveaway.status !== GiveawayStatus.SCHEDULED &&
				giveaway.status !== GiveawayStatus.COMPLETED
		);

		return { active, scheduled, completed, other };
	}, [giveaways]);

	const plan = userSubscriptionPlan || SubscriptionPlan.FREE;
	const giveawayLimit = PLANS[plan].giveawayLimit;
	const canCreateMore = giveawayCount < giveawayLimit;

	if (giveaways.length === 0) {
		return (
			<div className="text-center py-12">
				<h2 className="text-xl font-semibold mb-4">{t("empty.title")}</h2>
				<p className="text-gray-500 mb-6">{t("empty.description")}</p>

				<Link href={ROUTES.CREATE_GIVEAWAY}>
					<Button>
						<PlusIcon className="mr-2 h-4 w-4" />
						{t("buttons.create")}
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">{t("yourGiveaways")}</h2>

				{canCreateMore ? (
					<Link href={ROUTES.CREATE_GIVEAWAY}>
						<Button>
							<PlusIcon className="mr-2 h-4 w-4" />
							{t("buttons.create")}
						</Button>
					</Link>
				) : (
					<Link href={ROUTES.PRICING}>
						<Button>{t("buttons.upgrade")}</Button>
					</Link>
				)}
			</div>

			<div className="text-sm text-gray-500">
				{t("usedGiveaways", {
					count: giveawayCount,
					limit: giveawayLimit
				})}
			</div>

			{active.length > 0 && (
				<section>
					<h3 className="text-lg font-medium mb-4">{t("sections.active")}</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{active.map((giveaway) => (
							<GiveawayCard key={giveaway.id} giveaway={giveaway} />
						))}
					</div>
				</section>
			)}

			{scheduled.length > 0 && (
				<section>
					<h3 className="text-lg font-medium mb-4">{t("sections.upcoming")}</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{scheduled.map((giveaway) => (
							<GiveawayCard key={giveaway.id} giveaway={giveaway} />
						))}
					</div>
				</section>
			)}

			{completed.length > 0 && (
				<section>
					<h3 className="text-lg font-medium mb-4">
						{t("sections.completed")}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{completed.map((giveaway) => (
							<GiveawayCard key={giveaway.id} giveaway={giveaway} />
						))}
					</div>
				</section>
			)}

			{other.length > 0 && (
				<section>
					<h3 className="text-lg font-medium mb-4">{t("sections.other")}</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{other.map((giveaway) => (
							<GiveawayCard key={giveaway.id} giveaway={giveaway} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
