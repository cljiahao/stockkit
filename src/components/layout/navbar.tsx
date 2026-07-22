import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PAGE_ROUTES } from '@/lib/constants/routes';

interface NavbarProps {
  authed?: boolean;
}

// Public-marketing nav only — the dashboard uses its own DashboardNav
// (vendor name + sign out), never this one, so this stays a plain server
// component: logo plus one auth-aware primary action, no client JS needed.
export function Navbar({ authed = false }: NavbarProps) {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={PAGE_ROUTES.HOME} className="font-display text-xl font-bold tracking-tight">
          <span className="text-primary">stock</span>
          <span className="text-foreground">kit</span>
        </Link>

        <div className="flex items-center gap-2">
          {authed ? (
            <Button asChild className="h-10 rounded-lg px-5 font-semibold">
              <Link href={PAGE_ROUTES.DASHBOARD}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="h-10 rounded-lg px-4">
                <Link href={PAGE_ROUTES.LOGIN}>Sign in</Link>
              </Button>
              <Button asChild className="h-10 rounded-lg px-5 font-semibold">
                <Link href={`${PAGE_ROUTES.LOGIN}?mode=signup`}>Get started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
