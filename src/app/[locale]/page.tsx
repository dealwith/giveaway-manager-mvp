import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AnimatedContent } from "components/home/animated-content";
import { Button } from "components/ui/button";
import { TextGenerateEffect } from "components/ui/text-generate-effect";
import { ROUTES } from "constants/routes";

export default async function HomePage() {
	const t = await getTranslations("home");

	const features = [
		{
			title: t("feature1.title"),
			description: t("feature1.description"),
			icon: "⚡"
		},
		{
			title: t("feature2.title"),
			description: t("feature2.description"),
			icon: "🎯"
		},
		{
			title: t("feature3.title"),
			description: t("feature3.description"),
			icon: "🔗"
		},
		{
			title: t("feature4.title"),
			description: t("feature4.description"),
			icon: "📊"
		}
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<main className="max-w-7xl mx-auto px-6 py-20">
				<AnimatedContent>
					<h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
						<span className="text-foreground">{t("title1")}</span>
						<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
							{t("title2")}
						</span>
						<span className="text-gray-600 dark:text-gray-400">
							{t("title3")}
						</span>
					</h1>

					<div className="max-w-3xl mx-auto mb-12">
						<TextGenerateEffect
							words={t("subtitle")}
							className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
						/>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
						<Link href={ROUTES.SIGNUP}>
							<Button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
								{t("cta.startFreeTrial")}
							</Button>
						</Link>
						<Link href={ROUTES.PRICING}>
							<Button className="px-8 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-full text-lg font-semibold hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300">
								{t("cta.watchDemo")}
							</Button>
						</Link>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
						<div className="text-center">
							<div className="text-3xl font-bold text-purple-600 mb-2">
								10K+
							</div>
							<div className="text-gray-600 dark:text-gray-400">
								{t("stats.giveaways")}
							</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600 mb-2">500K+</div>
							<div className="text-gray-600 dark:text-gray-400">
								{t("stats.participants")}
							</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600 mb-2">
								99.9%
							</div>
							<div className="text-gray-600 dark:text-gray-400">
								{t("stats.uptime")}
							</div>
						</div>
					</div>
				</AnimatedContent>

				<section id="features" className="py-20">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
							{t("features.title")}
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							{t("features.description")}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<div
								key={index}
								className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100 dark:border-gray-700"
							>
								<div className="text-4xl mb-4">{feature.icon}</div>
								<h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</section>

				<section className="py-20 text-center">
					<div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
						<h2 className="text-4xl font-bold mb-4">{t("cta.final.title")}</h2>
						<p className="text-xl mb-8 opacity-90">
							{t("cta.final.description")}
						</p>
						<Link href={ROUTES.SIGNUP}>
							<Button className="px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
								{t("cta.final.getStarted")}
							</Button>
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
}
