import { Analytics } from "@vercel/analytics/next";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { ReactNode } from "react";

import { Footer } from "components/layout/footer";
import { Header } from "components/layout/header";
import { SITE } from "constants/site";
import { getSession } from "lib/auth";
import { SessionProvider } from "providers/session-provider";
import { SWRProvider } from "providers/swr-provider";
import { ThemeProvider } from "providers/theme-provider";

import { routing } from "/i18n/routing";
import "../globals.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	preload: true
});

export const metadata: Metadata = {
	title: {
		default: SITE.NAME,
		template: `%s | ${SITE.NAME}`
	},
	description: SITE.DESCRIPTION
};

interface RootLayoutProps {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}

export default async function RootLayout({
	children,
	params
}: RootLayoutProps) {
	const session = await getSession();
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
			</head>
			<body className={inter.className}>
				<NextIntlClientProvider>
					<ThemeProvider attribute="class" defaultTheme="system">
						<SessionProvider session={session}>
							<SWRProvider>
								<div className="flex min-h-screen flex-col">
									<Header />
									<main className="flex-1">{children}</main>
									<Footer />
								</div>
							</SWRProvider>
						</SessionProvider>
					</ThemeProvider>
				</NextIntlClientProvider>
				<Analytics />
			</body>
		</html>
	);
}
