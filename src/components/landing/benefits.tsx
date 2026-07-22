import { Boxes, Coins, History } from 'lucide-react';

import { ElevatedCard } from '@/components/elevated-card';

const BENEFITS = [
  {
    icon: Boxes,
    title: 'Always know your on-hand count',
    body: 'Every restock, waste, and adjustment updates a running balance per product — no more counting shelves to find out what you actually have.',
  },
  {
    icon: Coins,
    title: "See what it's really costing you",
    body: 'Carry a per-unit cost on every product and stockkit rolls it up into your total inventory value automatically.',
  },
  {
    icon: History,
    title: 'Nothing gets lost or overwritten',
    body: 'Every stock change is kept as a permanent, append-only record — restock, waste, and adjustment history you can always look back on.',
  },
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h2 className="font-display mb-10 text-center text-3xl font-semibold">
        Why vendors pick stockkit
      </h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <ElevatedCard
            key={b.title}
            className="fade-rise p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <b.icon className="text-primary size-6" aria-hidden />
            <h3 className="mt-4 text-xl font-semibold">{b.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{b.body}</p>
          </ElevatedCard>
        ))}
      </div>
    </section>
  );
}
