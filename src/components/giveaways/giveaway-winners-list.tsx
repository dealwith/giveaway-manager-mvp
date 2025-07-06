"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { GiveawayWinner } from "app-types/giveaway";
import { Badge } from "components/ui/badge";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "components/ui/table";

interface GiveawayWinnersListProps {
	winners: GiveawayWinner[];
}

export function GiveawayWinnersList({ winners }: GiveawayWinnersListProps) {
	const t = useTranslations("dashboard.giveaways.winners");

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">{t("title")}</h2>

			<Table>
				<TableCaption>{t("description")}</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>{t("columns.username")}</TableHead>
						<TableHead>{t("columns.date")}</TableHead>
						<TableHead>{t("columns.messageStatus")}</TableHead>
						<TableHead>{t("columns.likeStatus")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{winners.map((winner) => (
						<TableRow key={winner.id}>
							<TableCell className="font-medium">@{winner.username}</TableCell>
							<TableCell>
								{format(new Date(winner.createdAt), t("dateFormat"))}
							</TableCell>
							<TableCell>
								<Badge
									variant={
										winner.messageStatus === "sent" ? "success" : "destructive"
									}
								>
									{winner.messageStatus === "sent"
										? t("status.sent")
										: t("status.failed")}
								</Badge>
							</TableCell>
							<TableCell>
								<Badge
									variant={
										winner.likeStatus === "sent" ? "success" : "destructive"
									}
								>
									{winner.likeStatus === "sent"
										? t("status.sent")
										: t("status.failed")}
								</Badge>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
