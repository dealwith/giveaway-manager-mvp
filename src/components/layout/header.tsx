"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

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
	const { data: session } = useSession();

	return (
		<header className="border-b bg-background">
			<div className="container flex h-16 items-center justify-between py-4">
				<div className="flex items-center gap-6">
					<Link href={ROUTES.HOME} className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">G</span>
						</div>
						<span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
							GiveawayManager
						</span>
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
								<Button variant="outline">Sign In</Button>
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
