import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PAGE_ROUTES } from '@/lib/constants/routes';

interface CtaProps {
  authed?: boolean;
}

export function Cta({ authed = false }: CtaProps) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-14 text-center">
        <h2 className="text-3xl font-semibold">Know your numbers before you run out.</h2>
        <p className="text-primary-foreground/80 max-w-md">
          Free to use today. Add your products and start logging stock in minutes.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-2">
          <Link href={authed ? PAGE_ROUTES.DASHBOARD : `${PAGE_ROUTES.LOGIN}?mode=signup`}>
            {authed ? 'Go to dashboard' : 'Get started'}
          </Link>
        </Button>
      </div>
    </section>
  );
}
