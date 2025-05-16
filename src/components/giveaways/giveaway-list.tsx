import { useMemo } from "react";
import { Giveaway, GiveawayStatus } from "@/types/giveaway";
import { GiveawayCard } from "./giveaway-card";
import { Button } from "@components/ui/Button";
import { PlusIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PLANS } from "@/constants/plans";
import { SubscriptionPlan } from "@/types/subscription";

interface GiveawayListProps {
	giveaways: Giveaway[];
	giveawayCount: number;
}

export function GiveawayList({ giveaways, giveawayCount }: GiveawayListProps) {
	const { data: session } = useSession();

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

	const plan = session?.user?.plan || SubscriptionPlan.FREE;
	const giveawayLimit = PLANS[plan].giveawayLimit;
	const canCreateMore = giveawayCount < giveawayLimit;

	if (giveaways.length === 0) {
		return (
			<div className="text-center py-12">
				<h2 className="text-xl font-semibold mb-4">No Giveaways Yet</h2>
				<p className="text-gray-500 mb-6">
					Create your first giveaway to get started
				</p>

				<Link href={ROUTES.CREATE_GIVEAWAY}>
					<Button>
						<PlusIcon className="mr-2 h-4 w-4" />
						Create Giveaway
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Your Giveaways</h2>

				{canCreateMore ? (
					<Link href={ROUTES.CREATE_GIVEAWAY}>
						<Button>
							<PlusIcon className="mr-2 h-4 w-4" />
							Create Giveaway
						</Button>
					</Link>
				) : (
					<Link href={ROUTES.PRICING}>
						<Button>Upgrade Plan</Button>
					</Link>
				)}
			</div>

			<div className="text-sm text-gray-500">
				{giveawayCount} of {giveawayLimit} giveaways used
			</div>

			{active.length > 0 && (
				<section>
					<h3 className="text-lg font-medium mb-4">Active</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{active.map((giveaway) => (
							<GiveawayCard key={giveaway.id} giveaway={giveaway} />
						))}
					</div>
				</section>
			)}

			{scheduled.length > 0 && (
				<section>
					<h3 className="text-lg font-medium mb-4">Upcoming</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{scheduled.map((giveaway) => (
							<GiveawayCard key={giveaway.id} giveaway={giveaway} />
						))}
					</div>
				</section>
			)}

			{completed.length > 0 && (
				<section>
					<h3 className="text-lg font-medium mb-4">Completed</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{completed.map((giveaway) => (
							<GiveawayCard key={giveaway.id} giveaway={giveaway} />
						))}
					</div>
				</section>
			)}

			{other.length > 0 && (
				<section>
					<h3 className="text-lg font-medium mb-4">Other</h3>
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
