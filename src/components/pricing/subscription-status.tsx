"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { SubscriptionPlan } from "app-types/subscription";
import { Alert, AlertDescription } from "components/ui/alert";
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

export function SubscriptionStatus() {
	const t = useTranslations("dashboard.settings.subscription");
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	if (!session) {
		return null;
	}

	const plan = session.user.subscriptionPlan || SubscriptionPlan.FREE;
	const planDetails = PLANS[plan];

	const handleCancelSubscription = async () => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch("/api/subscription/cancel", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					userId: session.user.id
				})
			});

			if (!response.ok) {
				throw new Error("Failed to cancel subscription");
			}

			setSuccess(t("success.canceled"));
		} catch (error) {
			console.error("Error canceling subscription:", error);
			setError(t("errors.default"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("title")}</CardTitle>
				<CardDescription>{t("description")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert variant="success">
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-1">
					<div className="font-medium">{t("currentPlan.label")}</div>
					<div className="flex items-center gap-2">
						<span className="text-lg">{planDetails.name}</span>
						{plan === SubscriptionPlan.PRO && (
							<span className="text-sm text-muted-foreground">
								(${planDetails.price}/month)
							</span>
						)}
					</div>
				</div>

				<div className="space-y-1">
					<div className="font-medium">{t("features.label")}</div>
					<ul className="list-disc pl-5 space-y-1">
						{planDetails.features.map((feature, i) => (
							<li key={i}>{t(`features.items.${feature}`)}</li>
						))}
					</ul>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between">
				{plan === SubscriptionPlan.FREE ? (
					<Link href={ROUTES.PRICING}>
						<Button>{t("upgradeButton")}</Button>
					</Link>
				) : (
					<Button
						variant="outline"
						onClick={handleCancelSubscription}
						disabled={isLoading}
					>
						{isLoading ? t("buttons.loading") : t("buttons.cancel")}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
