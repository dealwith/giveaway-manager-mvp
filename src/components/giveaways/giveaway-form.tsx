"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Alert, AlertDescription } from "@components/ui/alert";
import { ROUTES } from "@constants/routes";
import { GiveawayStatus } from "@app-types/giveaway";
import { GIVEAWAY_VALIDATION } from "@constants/giveaway";
import { updateGiveaway } from "@lib/db";
import { useSession } from "next-auth/react";
import { hasReachedGiveawayLimit } from "@lib/db";
import { DateTimePicker } from "@components/ui/date-time-picker";
import { isValidInstagramPostUrl } from "@lib/instagram";
import { PLANS } from "@constants/plans";
import { SubscriptionPlan } from "@app-types/subscription";

const giveawaySchema = z
	.object({
		title: z
			.string()
			.min(
				GIVEAWAY_VALIDATION.TITLE_MIN,
				`Title must be at least ${GIVEAWAY_VALIDATION.TITLE_MIN} characters`
			)
			.max(
				GIVEAWAY_VALIDATION.TITLE_MAX,
				`Title must be at most ${GIVEAWAY_VALIDATION.TITLE_MAX} characters`
			),
		description: z
			.string()
			.max(
				GIVEAWAY_VALIDATION.DESCRIPTION_MAX,
				`Description must be at most ${GIVEAWAY_VALIDATION.DESCRIPTION_MAX} characters`
			)
			.optional(),
		postUrl: z
			.string()
			.url("Please enter a valid URL")
			.refine(
				(url) => isValidInstagramPostUrl(url),
				"Please enter a valid Instagram post URL"
			),
		documentUrl: z.string().url("Please enter a valid URL"),
		keyword: z
			.string()
			.min(
				GIVEAWAY_VALIDATION.KEYWORD_MIN,
				`Keyword must be at least ${GIVEAWAY_VALIDATION.KEYWORD_MIN} character`
			)
			.max(
				GIVEAWAY_VALIDATION.KEYWORD_MAX,
				`Keyword must be at most ${GIVEAWAY_VALIDATION.KEYWORD_MAX} characters`
			),
		startTime: z
			.date()
			.refine((date) => date > new Date(), "Start time must be in the future"),
		endTime: z
			.date()
			.refine((date) => date > new Date(), "End time must be in the future"),
	})
	.refine((data) => data.endTime > data.startTime, {
		message: "End time must be after start time",
		path: ["endTime"],
	});

type GiveawayFormValues = z.infer<typeof giveawaySchema>;

interface GiveawayFormProps {
	giveaway?: {
		id: string;
		title: string;
		description?: string;
		postUrl: string;
		documentUrl: string;
		keyword: string;
		startTime: Date;
		endTime: Date;
		status: GiveawayStatus;
	};
}

export function GiveawayForm({ giveaway }: GiveawayFormProps) {
	const router = useRouter();
	const { data: session } = useSession();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<GiveawayFormValues>({
		resolver: zodResolver(giveawaySchema),
		defaultValues: giveaway
			? {
					title: giveaway.title,
					description: giveaway.description || "",
					postUrl: giveaway.postUrl,
					documentUrl: giveaway.documentUrl,
					keyword: giveaway.keyword,
					startTime: new Date(giveaway.startTime),
					endTime: new Date(giveaway.endTime),
				}
			: {
					title: "",
					description: "",
					postUrl: "",
					documentUrl: "",
					keyword: "",
					startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
					endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
				},
	});

	const onSubmit = async (data: GiveawayFormValues) => {
		if (!session?.user) {
			setError("You must be signed in to create a giveaway");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			if (!giveaway) {
				// Check if user has reached their giveaway limit
				const reachedLimit = await hasReachedGiveawayLimit(
					session.user.id,
					session.user.subscriptionPlan || SubscriptionPlan.FREE
				);

				if (reachedLimit) {
					setError(
						`You've reached your limit of ${
							PLANS[session.user.subscriptionPlan || SubscriptionPlan.FREE].giveawayLimit
						} giveaways. Please upgrade your plan to create more.`
					);
					setIsLoading(false);
					return;
				}

				router.push(ROUTES.GIVEAWAYS);
			} else {
				// Update existing giveaway
				await updateGiveaway(giveaway.id, {
					title: data.title,
					description: data.description,
					postUrl: data.postUrl,
					documentUrl: data.documentUrl,
					keyword: data.keyword,
					startTime: data.startTime,
					endTime: data.endTime,
				});

				router.push(ROUTES.VIEW_GIVEAWAY(giveaway.id));
			}
		} catch (error) {
			console.error("Error saving giveaway:", error);
			setError("Failed to save giveaway. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						placeholder="My Amazing Giveaway"
						{...register("title")}
						disabled={isLoading}
					/>
					{errors.title && (
						<p className="text-sm text-red-500">{errors.title.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description (Optional)</Label>
					<Textarea
						id="description"
						placeholder="Describe your giveaway..."
						{...register("description")}
						disabled={isLoading}
					/>
					{errors.description && (
						<p className="text-sm text-red-500">{errors.description.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="postUrl">Instagram Post URL</Label>
					<Input
						id="postUrl"
						placeholder="https://www.instagram.com/p/..."
						{...register("postUrl")}
						disabled={isLoading}
					/>
					{errors.postUrl && (
						<p className="text-sm text-red-500">{errors.postUrl.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="documentUrl">Prize Document URL</Label>
					<Input
						id="documentUrl"
						placeholder="https://docs.google.com/..."
						{...register("documentUrl")}
						disabled={isLoading}
					/>
					{errors.documentUrl && (
						<p className="text-sm text-red-500">{errors.documentUrl.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="keyword">Keyword</Label>
					<Input
						id="keyword"
						placeholder="winner"
						{...register("keyword")}
						disabled={isLoading}
					/>
					{errors.keyword && (
						<p className="text-sm text-red-500">{errors.keyword.message}</p>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="startTime">Start Time</Label>
						<DateTimePicker
							control={control}
							name="startTime"
							disabled={isLoading}
						/>
						{errors.startTime && (
							<p className="text-sm text-red-500">{errors.startTime.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="endTime">End Time</Label>
						<DateTimePicker
							control={control}
							name="endTime"
							disabled={isLoading}
						/>
						{errors.endTime && (
							<p className="text-sm text-red-500">{errors.endTime.message}</p>
						)}
					</div>
				</div>

				<div className="flex gap-4 pt-4">
					<Button
						type="button"
						variant="ghost"
						onClick={() => router.back()}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button variant='outline' type="submit" disabled={isLoading}>
						{isLoading
							? giveaway
								? "Updating..."
								: "Creating..."
							: giveaway
								? "Update Giveaway"
								: "Create Giveaway"}
					</Button>
				</div>
			</form>
		</div>
	);
}
