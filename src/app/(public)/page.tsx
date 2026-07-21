import Link from 'next/link';

import { Button } from '@/components/ui/button';

const STEPS = [
  {
    title: 'Add your products',
    body: 'List what you stock, its unit cost, and a low-stock threshold.',
  },
  {
    title: 'Log stock in and out',
    body: 'Restock, record waste, or adjust counts — every change is logged.',
  },
  {
    title: 'Watch your numbers',
    body: 'See total inventory value and get alerted when something runs low.',
  },
];

const FAQ = [
  {
    q: 'Does stockkit track sales automatically?',
    a: 'Not yet — today it’s manual stock in/out and costing. Automatic sales-linked stock tracking is planned.',
  },
  {
    q: 'What counts as a stock movement?',
    a: 'Restock (adding stock), waste (removing spoiled/lost stock), or adjustment (correcting a count) — every movement is kept as a permanent record.',
  },
  {
    q: 'Is there a free plan?',
    a: 'stockkit is free to use today.',
  },
];

export default function Home() {
  return (
    <>
      <div className="flex-center min-h-screen flex-col gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
          <span className="text-primary">stock</span>
          <span>kit</span>
        </h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Track stock in and out, and know what every product actually costs
          you.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/login">Get started</Link>
        </Button>
      </div>

      <section id="how" className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="mb-10 text-center text-3xl font-semibold">
          Up and running in three steps
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border p-6">
              <p className="font-mono text-xs text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="mb-10 text-center text-3xl font-semibold">
          Questions
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group overflow-hidden rounded-xl border bg-card open:border-primary/50"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset">
                <span className="text-base font-semibold leading-snug">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm leading-relaxed text-foreground/80">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
