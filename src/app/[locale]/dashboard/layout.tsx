import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ReactNode } from "react";

import { DashboardLayout } from "components/layout/dashboard-layout";
import { ROUTES } from "constants/routes";
import { authOptions } from "lib/auth";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default async function DashboardRootLayout({
	children
}: DashboardLayoutProps) {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect(ROUTES.SIGNIN);
	}

	return <DashboardLayout>{children}</DashboardLayout>;
}
