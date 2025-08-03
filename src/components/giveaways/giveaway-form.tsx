"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GiveawayStatus } from "app-types/giveaway";
import { SubscriptionPlan } from "app-types/subscription";
import { Alert, AlertDescription } from "components/ui/alert";
import { Button } from "components/ui/button";
import { DateTimePicker } from "components/ui/date-time-picker";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import { GIVEAWAY_VALIDATION } from "constants/giveaway";
import { PLANS } from "constants/plans";
import { ROUTES } from "constants/routes";
import { updateGiveaway } from "lib/db";
import { hasReachedGiveawayLimit } from "lib/db";
import { isValidInstagramPostUrl } from "lib/instagram";

const giveawaySchema = z
	.object({
		title: z
			.string()
			.min(GIVEAWAY_VALIDATION.TITLE_MIN, "validation.titleMin")
			.max(GIVEAWAY_VALIDATION.TITLE_MAX, "validation.titleMax"),
		description: z
			.string()
			.max(GIVEAWAY_VALIDATION.DESCRIPTION_MAX, "validation.descriptionMax")
			.optional(),
		postUrl: z
			.string()
			.min(1, "validation.required")
			.refine((value) => {
				// Check if it's a media ID (numeric string)
				if (/^\d+(_\d+)?$/.test(value)) {
					return true;
				}
				// Otherwise, it should be a valid Instagram URL
				try {
					const url = new URL(value);
					return isValidInstagramPostUrl(value);
				} catch {
					return false;
				}
			}, "validation.instagramUrlOrId"),
		documentUrl: z.string().url("validation.enterValidUrl"),
		keyword: z
			.string()
			.min(GIVEAWAY_VALIDATION.KEYWORD_MIN, "validation.keywordMin")
			.max(GIVEAWAY_VALIDATION.KEYWORD_MAX, "validation.keywordMax"),
		startTime: z
			.date()
			.refine((date) => date > new Date(), "validation.futureStart"),
		endTime: z
			.date()
			.refine((date) => date > new Date(), "validation.futureEnd")
	})
	.refine((data) => data.endTime > data.startTime, {
		message: "validation.endAfterStart",
		path: ["endTime"]
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
	const t = useTranslations("dashboard.createGiveaway.form");

	const {
		register,
		handleSubmit,
		formState: { errors },
		control
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
					endTime: new Date(giveaway.endTime)
				}
			: {
					title: "",
					description: "",
					postUrl: "",
					documentUrl: "",
					keyword: "",
					startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
					endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
				}
	});

	const onSubmit = async (data: GiveawayFormValues) => {
		if (!session?.user) {
			setError(t("errors.notSignedIn"));

			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			if (!giveaway) {
				const reachedLimit = await hasReachedGiveawayLimit(
					session.user.id,
					session.user.subscriptionPlan || SubscriptionPlan.FREE
				);

				if (reachedLimit) {
					setError(
						t("errors.limitReached", {
							limit:
								PLANS[session.user.subscriptionPlan || SubscriptionPlan.FREE]
									.giveawayLimit
						})
					);
					setIsLoading(false);

					return;
				}
			}

			if (giveaway) {
				await updateGiveaway(giveaway.id, {
					title: data.title,
					description: data.description,
					postUrl: data.postUrl,
					documentUrl: data.documentUrl,
					keyword: data.keyword,
					startTime: data.startTime,
					endTime: data.endTime
				});

				router.push(ROUTES.VIEW_GIVEAWAY(giveaway.id));
			} else {
				router.push(ROUTES.GIVEAWAYS);
			}
		} catch (error) {
			console.error("Error saving giveaway:", error);
			setError(t("errors.saveFailed"));
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
					<Label htmlFor="title">{t("fields.title.label")}</Label>
					<Input
						id="title"
						placeholder={t("fields.title.placeholder")}
						{...register("title")}
						disabled={isLoading}
					/>
					{errors.title && errors.title.message && (
						<p className="text-sm text-red-500">{t(errors.title.message)}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">{t("fields.description.label")}</Label>
					<Textarea
						id="description"
						placeholder={t("fields.description.placeholder")}
						{...register("description")}
						disabled={isLoading}
					/>
					{errors.description && errors.description.message && (
						<p className="text-sm text-red-500">
							{t(errors.description.message)}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="postUrl">{t("fields.postUrl.label")}</Label>
					<Input
						id="postUrl"
						placeholder={t("fields.postUrl.placeholder")}
						{...register("postUrl")}
						disabled={isLoading}
					/>
					<p className="text-sm text-muted-foreground">{t("fields.postUrl.helper")}</p>
					{errors.postUrl && errors.postUrl.message && (
						<p className="text-sm text-red-500">{t(errors.postUrl.message)}</p>
					)}
					{session?.user?.instagram?.username && (
						<p className="text-sm text-muted-foreground">
							Only posts from @{session.user.instagram.username} can be used
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="documentUrl">{t("fields.documentUrl.label")}</Label>
					<Input
						id="documentUrl"
						placeholder={t("fields.documentUrl.placeholder")}
						{...register("documentUrl")}
						disabled={isLoading}
					/>
					{errors.documentUrl && errors.documentUrl.message && (
						<p className="text-sm text-red-500">
							{t(errors.documentUrl.message)}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="keyword">{t("fields.keyword.label")}</Label>
					<Input
						id="keyword"
						placeholder={t("fields.keyword.placeholder")}
						{...register("keyword")}
						disabled={isLoading}
					/>
					{errors.keyword && errors.keyword.message && (
						<p className="text-sm text-red-500">{t(errors.keyword.message)}</p>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="startTime">{t("fields.startTime.label")}</Label>
						<DateTimePicker
							control={control}
							name="startTime"
							disabled={isLoading}
						/>
						{errors.startTime && errors.startTime.message && (
							<p className="text-sm text-red-500">
								{t(errors.startTime.message)}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="endTime">{t("fields.endTime.label")}</Label>
						<DateTimePicker
							control={control}
							name="endTime"
							disabled={isLoading}
						/>
						{errors.endTime && errors.endTime.message && (
							<p className="text-sm text-red-500">
								{t(errors.endTime.message)}
							</p>
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
						{t("buttons.cancel")}
					</Button>
					<Button variant="outline" type="submit" disabled={isLoading}>
						{isLoading
							? giveaway
								? t("buttons.updating")
								: t("buttons.creating")
							: giveaway
								? t("buttons.update")
								: t("buttons.create")}
					</Button>
				</div>
			</form>
		</div>
	);
}
