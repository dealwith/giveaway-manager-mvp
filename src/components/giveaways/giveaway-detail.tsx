"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	CalendarIcon,
	ClockIcon,
	ExternalLinkIcon,
	PencilIcon,
	TagIcon,
	TrashIcon,
	UsersIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Giveaway, GiveawayStatus, GiveawayWinner } from "app-types/giveaway";
import { Alert, AlertDescription } from "components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "components/ui/alert-dialog";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import {
	GIVEAWAY_STATUS_COLORS,
	GIVEAWAY_STATUS_LABELS
} from "constants/giveaway";
import { ROUTES } from "constants/routes";
import { deleteGiveaway, updateGiveaway } from "lib/db";

import { GiveawayWinnersList } from "./giveaway-winners-list";

interface GiveawayDetailProps {
	giveaway: Giveaway;
	winners: GiveawayWinner[];
}

export function GiveawayDetail({ giveaway, winners }: GiveawayDetailProps) {
	const t = useTranslations("dashboard.giveaways.detail");
	const statusT = useTranslations("dashboard.giveaways.card");
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCanceling, setIsCanceling] = useState(false);

	const isActive = giveaway.status === GiveawayStatus.ACTIVE;
	const isScheduled = giveaway.status === GiveawayStatus.SCHEDULED;
	const isCompleted = giveaway.status === GiveawayStatus.COMPLETED;
	const isCanceled = giveaway.status === GiveawayStatus.CANCELED;

	const canEdit = isScheduled;
	const canCancel = isScheduled || isActive;

	const handleCancel = async () => {
		setIsCanceling(true);
		setError(null);

		try {
			await updateGiveaway(giveaway.id, {
				status: GiveawayStatus.CANCELED
			});

			router.refresh();
		} catch (error) {
			console.error("Error canceling giveaway:", error);
			setError(t("errors.cantCancel"));
		} finally {
			setIsCanceling(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		setError(null);

		try {
			await deleteGiveaway(giveaway.id);
			router.push(ROUTES.GIVEAWAYS);
		} catch (error) {
			console.error("Error deleting giveaway:", error);
			setError(t("errors.cantDelete"));
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			<div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold">{giveaway.title}</h1>
					<div className="flex items-center gap-2 mt-2">
						<Badge variant={GIVEAWAY_STATUS_COLORS[giveaway.status]}>
							{statusT(GIVEAWAY_STATUS_LABELS[giveaway.status])}
						</Badge>

						{isActive && (
							<span className="text-sm text-gray-500">
								{t("endsIn", {
									time: formatDistanceToNow(new Date(giveaway.endTime), {
										addSuffix: true
									})
								})}
							</span>
						)}
					</div>
				</div>

				<div className="flex gap-2">
					{canEdit && (
						<Link href={ROUTES.EDIT_GIVEAWAY(giveaway.id)}>
							<Button variant="outline" size="sm">
								<PencilIcon className="h-4 w-4 mr-2" />
								{t("buttons.edit")}
							</Button>
						</Link>
					)}

					{canCancel && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="outline" size="sm" disabled={isCanceling}>
									{isCanceling
										? t("buttons.canceling")
										: t("buttons.cancelGiveaway")}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										{t("confirmDialog.cancel.title")}
									</AlertDialogTitle>
									<AlertDialogDescription>
										{t("confirmDialog.cancel.description")}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										{t("confirmDialog.actions.goBack")}
									</AlertDialogCancel>
									<AlertDialogAction onClick={handleCancel}>
										{t("confirmDialog.actions.cancel")}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="sm" disabled={isDeleting}>
								<TrashIcon className="h-4 w-4 mr-2" />
								{isDeleting ? t("buttons.deleting") : t("buttons.delete")}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									{t("confirmDialog.delete.title")}
								</AlertDialogTitle>
								<AlertDialogDescription>
									{t("confirmDialog.delete.description")}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>
									{t("confirmDialog.actions.cancel")}
								</AlertDialogCancel>
								<AlertDialogAction onClick={handleDelete}>
									{t("confirmDialog.actions.delete")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			{giveaway.description && (
				<Card>
					<CardContent className="pt-6">
						<p>{giveaway.description}</p>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>{t("details.title")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">{t("details.keyword.label")}</div>
								<div className="text-sm text-gray-500">{giveaway.keyword}</div>
							</div>
						</div>

						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">
									{t("details.startTime.label")}
								</div>
								<div className="text-sm text-gray-500">
									{format(new Date(giveaway.startTime), "PPP p")}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">{t("details.endTime.label")}</div>
								<div className="text-sm text-gray-500">
									{format(new Date(giveaway.endTime), "PPP p")}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<ExternalLinkIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">{t("details.post.label")}</div>
								<a
									href={giveaway.postUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-500 hover:underline"
								>
									{t("details.post.viewPost")}
								</a>
							</div>
						</div>

						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<ExternalLinkIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">{t("details.document.label")}</div>
								<a
									href={giveaway.documentUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-500 hover:underline"
								>
									{t("details.document.viewDocument")}
								</a>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t("stats.title")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<UsersIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">{t("stats.winners.label")}</div>
								<div className="text-sm text-gray-500">
									{winners.length}{" "}
									{winners.length === 1
										? t("stats.winners.single")
										: t("stats.winners.multiple")}
								</div>
							</div>
						</div>

						{(isActive || isCompleted) && (
							<p className="text-sm text-gray-500 pt-2">
								{t("description.autoMessage", { keyword: giveaway.keyword })}
							</p>
						)}

						{isScheduled && (
							<p className="text-sm text-gray-500 pt-2">
								{t("description.scheduled", {
									date: format(new Date(giveaway.startTime), "PPP p")
								})}
							</p>
						)}

						{isCanceled && (
							<p className="text-sm text-gray-500 pt-2">
								{t("description.canceled")}
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{winners.length > 0 && <GiveawayWinnersList winners={winners} />}
		</div>
	);
}
