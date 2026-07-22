import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';

interface HeroProps {
  authed?: boolean;
}

export function Hero({ authed = false }: HeroProps) {
  return (
    <div className="flex-center min-h-screen flex-col gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
        <BrandText />
      </h1>
      <p className="text-muted-foreground max-w-md text-lg">
        Track stock in and out, and know what every product actually costs you.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href={authed ? PAGE_ROUTES.DASHBOARD : `${PAGE_ROUTES.LOGIN}?mode=signup`}>
            {authed ? 'Go to dashboard' : 'Get started'}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="#how">See how it works</a>
        </Button>
      </div>
    </div>
  );
}
