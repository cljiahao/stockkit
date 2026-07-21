'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { navigatingAway, useAsyncAction } from '@/hooks';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { createClient } from '@/lib/supabase/client';

interface Props {
  vendorName: string;
}

export function DashboardNav({ vendorName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { pending, run } = useAsyncAction();

  function onSignOut() {
    return run(async () => {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
      await navigatingAway();
    });
  }

  return (
    <nav className="border-border bg-card sticky top-0 z-50 w-full border-b">
      <div className="flex-between min-h-16 px-6 py-3">
        <Link href={PAGE_ROUTES.DASHBOARD} className="text-xl font-bold tracking-tight">
          <span className="text-primary">stock</span>
          <span>kit</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground hidden text-sm font-medium sm:inline">
            {vendorName}
          </span>
          <Button variant="outline" size="sm" onClick={onSignOut} disabled={pending}>
            {pending ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </div>
    </nav>
  );
}
