import { Metadata } from "next";
import { useTranslations } from "next-intl";

import { PricingPlans } from "components/pricing/pricing-plans";

export const metadata: Metadata = {
	title: "Pricing",
	description: "Choose a plan that works for you"
};

export default function PricingPage() {
	const t = useTranslations("pricing");

	return (
		<div className="container py-10">
			<div className="mx-auto flex max-w-[980px] flex-col gap-8">
				<div className="flex flex-col items-center gap-4 text-center">
					<h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
						{t("title")}
					</h1>
					<p className="max-w-[750px] text-lg text-muted-foreground md:text-xl">
						{t("description")}
					</p>
				</div>
				<PricingPlans />
			</div>
		</div>
	);
}
