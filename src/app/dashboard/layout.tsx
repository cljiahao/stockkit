import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout';
import { createServerClient } from '@/lib/supabase/server';
import { DashboardNav } from './dashboard-nav';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Defense in depth — proxy.ts already redirects unauthenticated requests
  // to /dashboard before this layout renders.
  if (!user) redirect('/login');

  const { data: vendor } = await supabase
    .from('vendors')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  // avatar_url is arbitrary JSON on the auth user — read defensively, per
  // the profile settings standard's §3.1 (kit-local, never the shared table).
  const rawAvatarUrl = user.user_metadata?.avatar_url;
  const avatarUrl = typeof rawAvatarUrl === 'string' ? rawAvatarUrl : null;

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav vendorName={vendor?.name ?? 'Your stall'} avatarUrl={avatarUrl} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
