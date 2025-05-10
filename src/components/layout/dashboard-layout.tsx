import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@constants/routes';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import {
  GiftIcon,
  HomeIcon,
  SettingsIcon,
  DollarSignIcon
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Dashboard',
      href: ROUTES.DASHBOARD,
      icon: HomeIcon,
    },
    {
      title: 'Giveaways',
      href: ROUTES.GIVEAWAYS,
      icon: GiftIcon,
    },
    {
      title: 'Settings',
      href: ROUTES.SETTINGS,
      icon: SettingsIcon,
    },
    {
      title: 'Pricing',
      href: ROUTES.PRICING,
      icon: DollarSignIcon,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 container py-6 grid md:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden md:flex flex-col space-y-6">
          <nav className="grid gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start',
                    pathname === item.href && 'bg-muted'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex flex-col space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
