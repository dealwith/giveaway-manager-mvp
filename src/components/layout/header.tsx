"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ROUTES } from "@constants/routes";
import { SITE } from "@constants/site";
import { Button } from "@components/ui/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar";
import { MobileMenu } from "./mobile-menu";

export function Header() {
	const { data: session } = useSession();

	return (
		<header className="border-b bg-background">
			<div className="container flex h-16 items-center justify-between py-4">
				<div className="flex items-center gap-6">
					<Link href={ROUTES.HOME} className="flex items-center">
						<span className="text-xl font-bold">{SITE.NAME}</span>
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						<Link
							href={ROUTES.PRICING}
							className="text-sm font-medium transition-colors hover:text-primary"
						>
							Pricing
						</Link>
						{session && (
							<Link
								href={ROUTES.DASHBOARD}
								className="text-sm font-medium transition-colors hover:text-primary"
							>
								Dashboard
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
								<DropdownMenuLabel>My Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href={ROUTES.DASHBOARD}>Dashboard</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href={ROUTES.GIVEAWAYS}>Giveaways</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href={ROUTES.SETTINGS}>Settings</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
								>
									Sign Out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="hidden md:flex items-center gap-2">
							<Link href={ROUTES.SIGNIN}>
								<Button variant="ghost">Sign In</Button>
							</Link>
							<Link href={ROUTES.SIGNUP}>
								<Button>Sign Up</Button>
							</Link>
						</div>
					)}

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
