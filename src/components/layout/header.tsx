"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { LanguageSelect } from "components/select/language-select";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { Button } from "components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "components/ui/dropdown-menu";
import { ROUTES } from "constants/routes";

import { MobileMenu } from "./mobile-menu";

export function Header() {
	const t = useTranslations("header");
	const { data: session } = useSession();

	return (
		<header className="border-b bg-background">
			<div className="container flex h-16 items-center justify-between py-4">
				<div className="flex items-center gap-6">
					<Link href={ROUTES.HOME} className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">G</span>
						</div>
						<span className="max-md:hidden text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
							GiveawayManager
						</span>
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						<Link
							href={ROUTES.PRICING}
							className="text-sm font-medium transition-colors hover:text-primary"
						>
							{t("navigation.pricing")}
						</Link>
						{session && (
							<Link
								href={ROUTES.DASHBOARD}
								className="text-sm font-medium transition-colors hover:text-primary"
							>
								{t("navigation.dashboard")}
							</Link>
						)}
					</nav>
				</div>

				<div className="flex items-center gap-2">
					{session ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={session.user.image || undefined}
											alt={session.user.name || "User"}
										/>
										<AvatarFallback>
											{getInitials(session.user.name || session.user.email)}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>{t("dropdown.account")}</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href={ROUTES.DASHBOARD}>{t("dropdown.dashboard")}</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href={ROUTES.GIVEAWAYS}>{t("dropdown.giveaways")}</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href={ROUTES.SETTINGS}>{t("dropdown.settings")}</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
								>
									{t("dropdown.signOut")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="hidden md:flex items-center gap-2">
							<Link href={ROUTES.SIGNIN}>
								<Button variant="outline">{t("auth.signIn")}</Button>
							</Link>
							<Link href={ROUTES.SIGNUP}>
								<Button>{t("auth.signUp")}</Button>
							</Link>
						</div>
					)}
					<LanguageSelect />
					<MobileMenu session={session} />
				</div>
			</div>
		</header>
	);
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.substring(0, 2);
}
