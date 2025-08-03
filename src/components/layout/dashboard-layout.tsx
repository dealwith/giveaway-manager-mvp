"use client";

import {
	DollarSignIcon,
	GiftIcon,
	HomeIcon,
	LinkIcon,
	SettingsIcon
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

import { Button } from "components/ui/button";
import { ROUTES } from "constants/routes";
import { Link, usePathname } from "i18n/navigation";
import { cn } from "lib/utils";

interface DashboardLayoutProps {
	children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const pathname = usePathname();
	const t = useTranslations("dashboard.nav");

	const navItems = [
		{
			title: t("dashboard"),
			href: ROUTES.DASHBOARD,
			icon: HomeIcon
		},
		{
			title: t("giveaways"),
			href: ROUTES.GIVEAWAYS,
			icon: GiftIcon
		},
		{
			title: t("connections"),
			href: ROUTES.CONNECTIONS,
			icon: LinkIcon
		},
		{
			title: t("settings"),
			href: ROUTES.SETTINGS,
			icon: SettingsIcon
		},
		{
			title: t("pricing"),
			href: ROUTES.PRICING,
			icon: DollarSignIcon
		}
	];

	return (
		<div className="flex min-h-screen flex-col">
			<div className="flex-1 container py-6 grid md:grid-cols-[240px_1fr] gap-8">
				<aside className="hidden md:flex flex-col space-y-6">
					<nav className="grid gap-2">
						{navItems.map((item, i) => (
							<Link key={i} href={item.href}>
								<Button
									variant="ghost"
									className={cn(
										"w-full justify-start",
										pathname === item.href && "bg-muted"
									)}
								>
									<item.icon className="mr-2 h-4 w-4" />
									{item.title}
								</Button>
							</Link>
						))}
					</nav>
				</aside>
				<main className="flex flex-col space-y-6">{children}</main>
			</div>
		</div>
	);
}
