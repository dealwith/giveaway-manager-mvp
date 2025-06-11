"use client";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from "components/ui/sheet";
import { ROUTES } from "constants/routes";

interface MobileMenuProps {
	session: Session | null;
}

export function MobileMenu({ session }: MobileMenuProps) {
	const t = useTranslations("mobile");
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
					<SheetTitle>{t("menu")}</SheetTitle>
				</SheetHeader>
				<nav className="flex flex-col gap-4 mt-8">
					<Link
						href={ROUTES.HOME}
						className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
						onClick={closeMenu}
					>
						{t("home")}
					</Link>
					<Link
						href={ROUTES.PRICING}
						className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
						onClick={closeMenu}
					>
						{t("pricing")}
					</Link>

					{session ? (
						<>
							<Link
								href={ROUTES.DASHBOARD}
								className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
								onClick={closeMenu}
							>
								{t("dashboard")}
							</Link>
							<Link
								href={ROUTES.GIVEAWAYS}
								className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
								onClick={closeMenu}
							>
								{t("giveaways")}
							</Link>
							<Link
								href={ROUTES.SETTINGS}
								className="text-lg font-medium px-2 py-2 hover:bg-muted rounded-md"
								onClick={closeMenu}
							>
								{t("settings")}
							</Link>
							<Button
								variant="ghost"
								className="justify-start px-2 text-lg font-medium"
								onClick={() => {
									signOut({ callbackUrl: ROUTES.HOME });
									closeMenu();
								}}
							>
								{t("signOut")}
							</Button>
						</>
					) : (
						<div className="flex flex-col gap-2 mt-4">
							<Link href={ROUTES.SIGNIN} onClick={closeMenu}>
								<Button variant="outline" className="w-full">
									{t("signIn")}
								</Button>
							</Link>
							<Link href={ROUTES.SIGNUP} onClick={closeMenu}>
								<Button className="w-full">{t("signUp")}</Button>
							</Link>
						</div>
					)}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
