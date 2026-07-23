import { LinkList, type LinkItem } from '@/components/widgets';

interface SiteFooterProps {
  tagline?: string;
  creditText?: string;
  links?: LinkItem[];
}

const defaultLinks: LinkItem[] = [];

export function SiteFooter({
  tagline = 'Inventory tracking for small vendors.',
  creditText = '© 2026 stockkit · a Merqo kit',
  links = defaultLinks,
}: SiteFooterProps) {
  return (
    <footer className="bg-foreground w-full">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Plain <a>, not next/link's Link — same-page hash jump to #top,
              see Navbar's wordmark comment for why Link doesn't reliably
              update the URL bar's hash on a fragment-only navigation. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#top" className="text-background font-display text-lg font-bold tracking-tight">
            StockKit
          </a>
          <p className="text-background/70 mt-1 text-xs">{tagline}</p>
        </div>
        <div className="flex items-center gap-5">
          {links.length > 0 && <LinkList links={links} className="text-background text-sm" />}
          <span className="text-background/70 text-xs">{creditText}</span>
        </div>
      </div>
    </footer>
  );
}
