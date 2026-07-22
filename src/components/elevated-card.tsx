import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ElevatedCardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section';
  className?: string;
  children: ReactNode;
}

// stockkit's own polished-card look for the public auth surfaces: rounded
// corners, a soft two-layer lifted shadow. Deliberately not qkit's
// perforated "Ticket" — that's qkit's own booth/receipt motif. See
// docs/superpowers/specs/2026-07-22-landing-login-color-refresh-design.md.
export function ElevatedCard({ as: As = 'div', className, children, ...props }: ElevatedCardProps) {
  return (
    <As
      className={cn(
        'bg-card rounded-[20px] border shadow-[0_1px_0_0_var(--color-border),0_12px_28px_-20px_rgba(0,0,0,0.35)]',
        className
      )}
      {...props}
    >
      {children}
    </As>
  );
}
