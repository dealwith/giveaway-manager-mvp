import Link from "next/link";

import { ROUTES } from "constants/routes";
import { SITE } from "constants/site";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t bg-background">
			<div className="container py-8 md:py-12">
				<div className="flex flex-col md:flex-row justify-between gap-8">
					<div className="space-y-4">
						<Link href={ROUTES.HOME} className="text-xl font-bold">
							{SITE.NAME}
						</Link>
						<p className="text-sm text-muted-foreground max-w-md">
							{SITE.DESCRIPTION}
						</p>
					</div>

					<div className="space-y-4">
						<h3 className="font-medium">Links</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href={ROUTES.HOME}
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href={ROUTES.PRICING}
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									Pricing
								</Link>
							</li>
							<li>
								<Link
									href={ROUTES.DASHBOARD}
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									Dashboard
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h3 className="font-medium">Legal</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/privacy"
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="text-sm text-muted-foreground hover:text-foreground"
								>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
					&copy; {currentYear} {SITE.NAME}. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
