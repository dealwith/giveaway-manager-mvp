import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Giveaway, GiveawayStatus } from "@app-types/giveaway";
import { ROUTES } from "@/constants/routes";
import {
	GIVEAWAY_STATUS_LABELS,
	GIVEAWAY_STATUS_COLORS,
} from "@/constants/giveaway";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";

interface GiveawayCardProps {
	giveaway: Giveaway;
}

export function GiveawayCard({ giveaway }: GiveawayCardProps) {
	const isActive = giveaway.status === GiveawayStatus.ACTIVE;
	const isCompleted = giveaway.status === GiveawayStatus.COMPLETED;
	const isCanceled = giveaway.status === GiveawayStatus.CANCELED;

	const getStatusColor = () => {
		return GIVEAWAY_STATUS_COLORS[giveaway.status];
	};

	return (
		<Card className="h-full flex flex-col">
			<CardHeader>
				<div className="flex justify-between items-start">
					<CardTitle className="text-lg font-bold">{giveaway.title}</CardTitle>
					<Badge variant={getStatusColor() as any}>
						{GIVEAWAY_STATUS_LABELS[giveaway.status]}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="flex-1">
				{giveaway.description && (
					<p className="text-sm text-gray-500 mb-4">{giveaway.description}</p>
				)}

				<div className="space-y-2">
					<div className="flex items-center text-sm">
						<span className="font-medium mr-2">Keyword:</span>
						<span className="text-blue-600">{giveaway.keyword}</span>
					</div>

					<div className="flex items-center text-sm">
						<span className="font-medium mr-2">Start:</span>
						<span>
							{format(new Date(giveaway.startTime), "MMM d, yyyy h:mm a")}
						</span>
					</div>

					<div className="flex items-center text-sm">
						<span className="font-medium mr-2">End:</span>
						<span>
							{format(new Date(giveaway.endTime), "MMM d, yyyy h:mm a")}
						</span>
					</div>

					{isActive && (
						<div className="flex items-center text-sm mt-2">
							<span className="font-medium mr-2">Active for:</span>
							<span>
								{formatDistanceToNow(new Date(giveaway.endTime), {
									addSuffix: true,
								})}
							</span>
						</div>
					)}

					{isCompleted && giveaway.winnerCount && (
						<div className="flex items-center text-sm mt-2">
							<span className="font-medium mr-2">Winners:</span>
							<span>{giveaway.winnerCount}</span>
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter>
				<Link href={ROUTES.VIEW_GIVEAWAY(giveaway.id)} className="w-full">
					<Button variant="default" className="w-full">
						View Details
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
