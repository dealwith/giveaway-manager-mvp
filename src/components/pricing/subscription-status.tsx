"use client";

import { useSession } from "next-auth/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { Button } from "@components/ui/button";
import { PLANS } from "@/constants/plans";
import { SubscriptionPlan } from "@app-types/subscription";
import Link from "next/link";
import { ROUTES } from "@constants/routes";
import { useState } from "react";
import { Alert, AlertDescription } from "@components/ui/alert";

export function SubscriptionStatus() {
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
			const response = await fetch('/api/subscription/cancel', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: session.user.id,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to cancel subscription');
			}

			setSuccess(
				"Your subscription has been canceled. You will continue to have access until the end of your billing period."
			);
		} catch (error) {
			console.error("Error canceling subscription:", error);
			setError("Failed to cancel subscription. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Your Subscription</CardTitle>
				<CardDescription>Manage your subscription plan</CardDescription>
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
					<div className="font-medium">Current Plan</div>
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
					<div className="font-medium">Features</div>
					<ul className="list-disc pl-5 space-y-1">
						{planDetails.features.map((feature: string, i: number) => (
							<li key={i}>{feature}</li>
						))}
					</ul>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between">
				{plan === SubscriptionPlan.FREE ? (
					<Link href={ROUTES.PRICING}>
						<Button>Upgrade</Button>
					</Link>
				) : (
					<Button
						variant="outline"
						onClick={handleCancelSubscription}
						disabled={isLoading}
					>
						{isLoading ? "Canceling..." : "Cancel Subscription"}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
