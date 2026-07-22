import { LinkList, type LinkItem } from '@/components/widgets';

interface SiteFooterProps {
  creditText?: string;
  links?: LinkItem[];
}

const defaultLinks: LinkItem[] = [];

export function SiteFooter({
  creditText = '© 2026 stockkit · a Merqo kit',
  links = defaultLinks,
}: SiteFooterProps) {
  return (
    <footer className="bg-foreground w-full">
      <div className="flex-between px-6 py-6">
        <p className="text-background text-sm">{creditText}</p>
        {links.length > 0 && <LinkList links={links} className="text-background text-sm" />}
      </div>
    </footer>
  );
}
