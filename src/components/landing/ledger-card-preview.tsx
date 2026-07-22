import { ArrowUpRight } from 'lucide-react';

import { ElevatedCard } from '@/components/elevated-card';
import { STOCK_STATUS_DOT_CLASS } from '@/lib/stock';
import { cn } from '@/lib/utils';

// A static marketing illustration (not real data) — stockkit's answer to
// qkit's live order-board carousel / loopkit's stamp card: show the actual
// product concept (a ledger entry) instead of describing it in text.
export function LedgerCardPreview() {
  return (
    <ElevatedCard className="fade-rise mx-auto w-full max-w-sm p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className={cn('size-2.5 rounded-full', STOCK_STATUS_DOT_CLASS.ok)} />
          <span className="text-sm font-semibold">Whole Bean Coffee 1kg</span>
        </div>
        <span className="text-muted-foreground text-xs">In stock</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">On hand</p>
          <p className="font-mono text-3xl font-semibold">42</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Unit cost</p>
          <p className="font-mono text-3xl font-semibold">$18.50</p>
        </div>
      </div>
      <div className="border-border mt-5 border-t pt-4">
        <div className="flex items-center gap-2 text-sm">
          <ArrowUpRight className="text-stock-ok size-4" aria-hidden />
          <span className="font-mono">+12 restock</span>
          <span className="text-muted-foreground">· 2h ago</span>
        </div>
      </div>
    </ElevatedCard>
  );
}
