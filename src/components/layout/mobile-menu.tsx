"use client";
import { useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { ROUTES } from "@constants/routes";
import { Button } from "@components/ui/Button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@components/ui/Sheet";
import { Menu } from "lucide-react";

interface MobileMenuProps {
	session: Session | null;
}

export function MobileMenu({ session }: MobileMenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	const closeMenu = () => setIsOpen(false);

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden">
					<Menu className="h-5 w-5" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-[300px] sm:w-[400px]">
				<SheetHeader>
					<SheetTitle>Menu</SheetTitle>
				</SheetHeader>
				<nav className="flex flex-col gap-4 mt-8">
					<Link
						href={ROUTES.HOME}
						className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
						onClick={closeMenu}
					>
						Home
					</Link>
					<Link
						href={ROUTES.PRICING}
						className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
						onClick={closeMenu}
					>
						Pricing
					</Link>

					{session ? (
						<>
							<Link
								href={ROUTES.DASHBOARD}
								className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
								onClick={closeMenu}
							>
								Dashboard
							</Link>
							<Link
								href={ROUTES.GIVEAWAYS}
								className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
								onClick={closeMenu}
							>
								Giveaways
							</Link>
							<Link
								href={ROUTES.SETTINGS}
								className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
								onClick={closeMenu}
							>
								Settings
							</Link>
							<Button
								variant="ghost"
								className="justify-start px-2 text-lg font-medium"
								onClick={() => {
									signOut({ callbackUrl: ROUTES.HOME });
									closeMenu();
								}}
							>
								Sign Out
							</Button>
						</>
					) : (
						<div className="flex flex-col gap-2 mt-4">
							<Link href={ROUTES.SIGNIN} onClick={closeMenu}>
								<Button variant="outline" className="w-full">
									Sign In
								</Button>
							</Link>
							<Link href={ROUTES.SIGNUP} onClick={closeMenu}>
								<Button className="w-full">Sign Up</Button>
							</Link>
						</div>
					)}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
