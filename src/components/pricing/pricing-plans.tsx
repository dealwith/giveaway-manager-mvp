"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/Card";
import { PLANS } from "@constants/plans";
import { SubscriptionPlan } from "@types/subscription";
import { Alert, AlertDescription } from "@components/ui/Alert";
import { ROUTES } from "@constants/routes";
import { CheckIcon } from "lucide-react";
import { createCheckoutSession } from "@lib/stripe";

export function PricingPlans() {
	const router = useRouter();
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState<SubscriptionPlan | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSubscribe = async (plan: SubscriptionPlan) => {
		if (!session) {
			router.push(`${ROUTES.SIGNIN}?callbackUrl=${ROUTES.PRICING}`);
			return;
		}

		if (plan === SubscriptionPlan.FREE) {
			router.push(ROUTES.DASHBOARD);
			return;
		}

		setIsLoading(plan);
		setError(null);

		try {
			const { url } = await createCheckoutSession({
				userId: session.user.id,
				priceId: PLANS[plan].stripePriceId,
				returnUrl: `${window.location.origin}${ROUTES.DASHBOARD}`,
			});

			if (url) {
				window.location.href = url;
			} else {
				throw new Error("Failed to create checkout session");
			}
		} catch (error) {
			console.error("Error creating checkout session:", error);
			setError("Failed to create checkout session. Please try again.");
		} finally {
			setIsLoading(null);
		}
	};

	const userCurrentPlan = session?.user?.plan || null;

	return (
		<div className="container">
			{error && (
				<Alert variant="destructive" className="mb-6">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{Object.entries(PLANS).map(([planKey, plan]) => {
					const planType = planKey as SubscriptionPlan;
					const isCurrentPlan = userCurrentPlan === planType;
					const isFreePlan = planType === SubscriptionPlan.FREE;

					return (
						<Card
							key={planKey}
							className={isCurrentPlan ? "border-primary" : ""}
						>
							<CardHeader>
								<CardTitle>{plan.name}</CardTitle>
								<CardDescription>{plan.description}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-baseline">
									<span className="text-3xl font-bold">${plan.price}</span>
									{!isFreePlan && (
										<span className="text-muted-foreground ml-1">/month</span>
									)}
								</div>
								<div className="space-y-2">
									{plan.features.map((feature, i) => (
										<div key={i} className="flex items-center">
											<CheckIcon className="h-4 w-4 text-green-500 mr-2" />
											<span>{feature}</span>
										</div>
									))}
								</div>
							</CardContent>
							<CardFooter>
								<Button
									onClick={() => handleSubscribe(planType)}
									className="w-full"
									disabled={isLoading !== null || isCurrentPlan}
									variant={isFreePlan ? "outline" : "default"}
								>
									{isLoading === planType
										? "Loading..."
										: isCurrentPlan
											? "Current Plan"
											: isFreePlan
												? "Get Started"
												: "Subscribe"}
								</Button>
							</CardFooter>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
