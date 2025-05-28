import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SITE } from '@/constants/site';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SessionProvider } from '@/providers/session-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { SWRProvider } from '@/providers/swr-provider';
import { getSession } from '@/lib/auth';
import './globals.css';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
});

export const metadata: Metadata = {
	title: {
		default: SITE.NAME,
		template: `%s | ${SITE.NAME}`,
	},
	description: SITE.DESCRIPTION,
};

interface RootLayoutProps {
	children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
	const session = await getSession();

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
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
			</body>
		</html>
	);
}
