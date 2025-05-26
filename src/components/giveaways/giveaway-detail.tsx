"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Giveaway, GiveawayStatus, GiveawayWinner } from "@app-types/giveaway";
import { ROUTES } from "@constants/routes";
import {
	GIVEAWAY_STATUS_LABELS,
	GIVEAWAY_STATUS_COLORS,
} from "@/constants/giveaway";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import {
	PencilIcon,
	TrashIcon,
	ExternalLinkIcon,
	ClockIcon,
	CalendarIcon,
	TagIcon,
	UsersIcon,
} from "lucide-react";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@components/ui/alert-dialog";
import { Alert, AlertDescription } from "@components/ui/alert";
import { updateGiveaway, deleteGiveaway } from "@lib/db";
import { GiveawayWinnersList } from "./giveaway-winners-list";
import Link from "next/link";

interface GiveawayDetailProps {
	giveaway: Giveaway;
	winners: GiveawayWinner[];
}

export function GiveawayDetail({ giveaway, winners }: GiveawayDetailProps) {
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
				status: GiveawayStatus.CANCELED,
			});

			router.refresh();
		} catch (error) {
			console.error("Error canceling giveaway:", error);
			setError("Failed to cancel giveaway");
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
			setError("Failed to delete giveaway");
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
							{GIVEAWAY_STATUS_LABELS[giveaway.status]}
						</Badge>

						{isActive && (
							<span className="text-sm text-gray-500">
								Ends{" "}
								{formatDistanceToNow(new Date(giveaway.endTime), {
									addSuffix: true,
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
								Edit
							</Button>
						</Link>
					)}

					{canCancel && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="outline" size="sm" disabled={isCanceling}>
									{isCanceling ? "Canceling..." : "Cancel Giveaway"}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Cancel Giveaway?</AlertDialogTitle>
									<AlertDialogDescription>
										This will permanently cancel the giveaway. This action
										cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Go Back</AlertDialogCancel>
									<AlertDialogAction onClick={handleCancel}>
										Cancel Giveaway
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="sm" disabled={isDeleting}>
								<TrashIcon className="h-4 w-4 mr-2" />
								{isDeleting ? "Deleting..." : "Delete"}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Giveaway?</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently delete the giveaway and all associated
									data. This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleDelete}>
									Delete
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
						<CardTitle>Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">Keyword</div>
								<div className="text-sm text-gray-500">{giveaway.keyword}</div>
							</div>
						</div>

						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">Start Time</div>
								<div className="text-sm text-gray-500">
									{format(new Date(giveaway.startTime), "PPP p")}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">End Time</div>
								<div className="text-sm text-gray-500">
									{format(new Date(giveaway.endTime), "PPP p")}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<ExternalLinkIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">Instagram Post</div>
								<a
									href={giveaway.postUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-500 hover:underline"
								>
									View Post
								</a>
							</div>
						</div>

						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<ExternalLinkIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">Prize Document</div>
								<a
									href={giveaway.documentUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-500 hover:underline"
								>
									View Document
								</a>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Stats</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
							<UsersIcon className="h-5 w-5 text-gray-400 mt-0.5" />
							<div>
								<div className="font-medium">Winners</div>
								<div className="text-sm text-gray-500">
									{winners.length} {winners.length === 1 ? "user" : "users"}
								</div>
							</div>
						</div>

						{(isActive || isCompleted) && (
							<p className="text-sm text-gray-500 pt-2">
								Users who commented with{" "}
								<span className="font-medium">{giveaway.keyword}</span> will
								automatically receive a direct message with the prize document
								link.
							</p>
						)}

						{isScheduled && (
							<p className="text-sm text-gray-500 pt-2">
								This giveaway is scheduled to start on{" "}
								{format(new Date(giveaway.startTime), "PPP p")}.
							</p>
						)}

						{isCanceled && (
							<p className="text-sm text-gray-500 pt-2">
								This giveaway was canceled.
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{winners.length > 0 && <GiveawayWinnersList winners={winners} />}
		</div>
	);
}
