'use client';

import { FeedbackForm } from '@/components/feedback-form';
import { SupportForm } from '@/components/support-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { navigatingAway, useAsyncAction } from '@/hooks';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { createClient } from '@/lib/supabase/client';
import { LifeBuoy, LogOut, Menu, MessageSquarePlus, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  vendorName: string;
  avatarUrl?: string | null;
}

function initials(label: string): string {
  const first = label.trim().charAt(0);
  return first ? first.toUpperCase() : '•';
}

/**
 * Dashboard sticky-header row, per docs/business/2026-07-21-dashboard-nav-standard.md:
 * burger far-left (below sm — stockkit has no page-level nav links today, so
 * the mobile panel is a placeholder for future links, not removed for that
 * reason), avatar/account dropdown far-right at every width. No Plan item —
 * stockkit has no vendor-tier concept (sanctioned skip, see this plan's
 * Global Constraints).
 */
export function DashboardNav({ vendorName, avatarUrl = null }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { pending, run } = useAsyncAction();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  function onSignOut() {
    return run(async () => {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
      await navigatingAway();
    });
  }

  return (
    <>
      <nav className="border-border bg-card sticky top-0 z-50 w-full border-b">
        <div className="flex-between min-h-16 px-3 py-3 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="text-muted-foreground hover:bg-secondary -ml-1.5 shrink-0 rounded-lg p-1.5 sm:hidden"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link href={PAGE_ROUTES.DASHBOARD} className="text-xl font-bold tracking-tight">
              <span className="text-primary">Stock</span>
              <span>Kit</span>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="hover:bg-secondary focus-visible:ring-ring/50 flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 text-left transition-colors outline-none focus-visible:ring-[3px]"
              >
                <Avatar className="ring-primary/25 size-8 shrink-0 rounded-md ring-1 ring-inset">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                  <AvatarFallback className="bg-primary/12 text-primary rounded-md font-mono text-xs font-semibold tracking-tight">
                    {initials(vendorName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[9rem] truncate text-sm font-medium sm:inline">
                  {vendorName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="px-2 py-2">
                <p className="truncate text-sm font-semibold">{vendorName}</p>
                <p className="text-muted-foreground text-xs font-normal">Vendor account</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="size-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onSelect={() => setHelpOpen(true)}>
                <LifeBuoy className="size-4" />
                Get help
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onSelect={() => setFeedbackOpen(true)}>
                <MessageSquarePlus className="size-4" />
                Feedback
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onSelect={onSignOut}
                disabled={pending}
              >
                <LogOut className="size-4" />
                {pending ? 'Signing out…' : 'Sign out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <Sheet open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-2xl">Share feedback</SheetTitle>
            <SheetDescription>
              What&apos;s working, what&apos;s missing, what&apos;s broken?
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <FeedbackForm />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-2xl">Get help</SheetTitle>
            <SheetDescription>
              Trouble with products, stock, or your account? Tell us and we&apos;ll sort it out.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <SupportForm />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
