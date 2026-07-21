import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex-center min-h-screen flex-col gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
        <span className="text-primary">stock</span>
        <span>kit</span>
      </h1>
      <p className="text-muted-foreground max-w-md text-lg">
        Track stock in and out, and know what every product actually costs you.
      </p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/login">Get started</Link>
      </Button>
    </div>
  );
}
