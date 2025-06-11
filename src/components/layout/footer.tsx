"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { ROUTES } from "constants/routes";
import { SITE } from "constants/site";

export function Footer() {
	const t = useTranslations("footer");
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t bg-background">
			<div className="container py-8 md:py-12">
				<div className="flex flex-col md:flex-row justify-between gap-8">
					<div className="space-y-4">
						<Link href={ROUTES.HOME} className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">G</span>
							</div>
							<span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
								GiveawayManager
							</span>
						</Link>
						<p className="text-sm text-muted-foreground max-w-md">
							{t("description")}
						</p>
					</div>

					<div className="space-y-4">
						<h3 className="font-medium">{t("links.title")}</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href={ROUTES.HOME}
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									{t("links.home")}
								</Link>
							</li>
							<li>
								<Link
									href={ROUTES.PRICING}
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									{t("links.pricing")}
								</Link>
							</li>
							<li>
								<Link
									href={ROUTES.DASHBOARD}
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									{t("links.dashboard")}
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h3 className="font-medium">{t("legal.title")}</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/privacy"
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									{t("legal.privacyPolicy")}
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									{t("legal.termsOfService")}
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
					&copy; {currentYear} {SITE.NAME}. {t("rights")}
				</div>
			</div>
		</footer>
	);
}
