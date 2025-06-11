"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "components/ui/button";
import { TextGenerateEffect } from "components/ui/text-generate-effect";
import { ROUTES } from "constants/routes";

export default function HomePage() {
	const [isVisible, setIsVisible] = useState(false);
	const t = useTranslations("home");

	useEffect(() => {
		setIsVisible(true);
	}, []);

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
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
			<main className="max-w-7xl mx-auto px-6 py-20">
				<div
					className={`text-center transition-all duration-1000 ${
						isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
					}`}
				>
					<h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
						{t("title")}
						<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
							Giveaways
						</span>
						<span className="text-gray-600">Effortlessly</span>
					</h1>

					<div className="max-w-3xl mx-auto mb-12">
						<TextGenerateEffect
							words={t("subtitle")}
							className="text-xl text-gray-600 leading-relaxed"
						/>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
						<Link href={ROUTES.SIGNUP}>
							<Button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
								{t("cta.startFreeTrial")}
							</Button>
						</Link>
						<Link href={ROUTES.PRICING}>
							<Button className="px-8 py-4 border-2 border-gray-200 rounded-full text-lg font-semibold hover:border-purple-300 hover:bg-purple-50 transition-all duration-300">
								{t("cta.watchDemo")}
							</Button>
						</Link>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
						<div className="text-center">
							<div className="text-3xl font-bold text-purple-600 mb-2">
								10K+
							</div>
							<div className="text-gray-600">{t("stats.giveaways")}</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600 mb-2">500K+</div>
							<div className="text-gray-600">{t("stats.participants")}</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600 mb-2">
								99.9%
							</div>
							<div className="text-gray-600">{t("stats.uptime")}</div>
						</div>
					</div>
				</div>

				<section id="features" className="py-20">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-800 mb-4">
							{t("features.title")}
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							{t("features.description")}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<div
								key={index}
								className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100"
							>
								<div className="text-4xl mb-4">{feature.icon}</div>
								<h3 className="text-xl font-bold text-gray-800 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
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
							<Button className="px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
								{t("cta.final.getStarted")}
							</Button>
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
}
