import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ROUTES } from '@/constants/routes';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardRootLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ROUTES.SIGNIN);
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
