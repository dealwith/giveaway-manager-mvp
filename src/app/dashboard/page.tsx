import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { ROUTES } from "@/constants/routes";
import { getUserGiveaways, countUserGiveaways } from "@/lib/db";
import { GiftIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { PLANS } from "@/constants/plans";
import { GiveawayStatus } from "@app-types/giveaway";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Manage your Instagram giveaways",
};

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	const giveaways = await getUserGiveaways(session.user.id);
	const giveawayCount = await countUserGiveaways(session.user.id);
	const planDetails = PLANS[session.user.plan];

	const activeGiveaways = giveaways.filter(
		(giveaway) => giveaway.status === GiveawayStatus.ACTIVE
	);
	const completedGiveaways = giveaways.filter(
		(giveaway) => giveaway.status === GiveawayStatus.COMPLETED
	);

	const canCreateMore = giveawayCount < planDetails.giveawayLimit;

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session.user.name || session.user.email}
					</p>
				</div>

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

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Giveaways
						</CardTitle>
						<GiftIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{giveawayCount}</div>
						<p className="text-xs text-muted-foreground">
							{planDetails.giveawayLimit - giveawayCount} remaining in your plan
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Giveaways
						</CardTitle>
						<GiftIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeGiveaways.length}</div>
						<p className="text-xs text-muted-foreground">Running right now</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Current Plan</CardTitle>
						<SettingsIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{planDetails.name}</div>
						<p className="text-xs text-muted-foreground">
							{planDetails.giveawayLimit} giveaways included
						</p>
					</CardContent>
					<CardFooter>
						<Link href={ROUTES.SETTINGS} className="w-full">
							<Button variant="outline" className="w-full">
								Manage Subscription
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>

			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Recent Giveaways</h2>

				{giveaways.length === 0 ? (
					<Card>
						<CardContent className="pt-6 pb-6 text-center">
							<p className="mb-4">You haven&apos;t created any giveaways yet</p>
							<Link href={ROUTES.CREATE_GIVEAWAY}>
								<Button>Create Your First Giveaway</Button>
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
										{giveaway.status === GiveawayStatus.ACTIVE
											? "Active"
											: giveaway.status === GiveawayStatus.COMPLETED
												? "Completed"
												: giveaway.status === GiveawayStatus.SCHEDULED
													? "Scheduled"
													: giveaway.status}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm">Keyword: {giveaway.keyword}</p>
								</CardContent>
								<CardFooter>
									<Link
										href={ROUTES.VIEW_GIVEAWAY(giveaway.id)}
										className="w-full"
									>
										<Button variant="outline" className="w-full">
											View Details
										</Button>
									</Link>
								</CardFooter>
							</Card>
						))}
					</div>
				)}

				{giveaways.length > 3 && (
					<div className="flex justify-center">
						<Link href={ROUTES.GIVEAWAYS}>
							<Button variant="outline">View All Giveaways</Button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
