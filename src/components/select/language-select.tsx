"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { Button } from "components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "components/ui/dropdown-menu";
import { cn } from "lib/utils";

const LANGUAGES = [
	{ code: "en", label: "English" },
	{ code: "ru", label: "Русский" },
	{ code: "es", label: "Español" },
	{ code: "pl", label: "Polski" },
	{ code: "ua", label: "Українська" }
];

export function LanguageSelect() {
	const router = useRouter();
	const pathname = usePathname();
	const currentLocale = useLocale();

	const handleChange = (locale: string) => {
		const segments = pathname.split("/").filter(Boolean);

		if (segments[0] && LANGUAGES.some((l) => l.code === segments[0])) {
			segments[0] = locale;
		} else {
			segments.unshift(locale);
		}

		router.replace("/" + segments.join("/"));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="text-sm">
					🌐{" "}
					{LANGUAGES.find((l) => l.code === currentLocale)?.label ??
						currentLocale}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{LANGUAGES.map(({ code, label }) => (
					<DropdownMenuItem
						key={code}
						onClick={() => handleChange(code)}
						className={cn(
							"cursor-pointer",
							code === currentLocale ? "font-semibold" : ""
						)}
					>
						{label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
