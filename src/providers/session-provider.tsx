'use client';

import type { Session } from 'next-auth';
import { ReactNode } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

interface SessionProviderProps {
	session: Session | null;
	children: ReactNode;
}

export function SessionProvider({ session, children }: SessionProviderProps) {
	return (
		<NextAuthSessionProvider session={session}>
			{children}
		</NextAuthSessionProvider>
	);
}
