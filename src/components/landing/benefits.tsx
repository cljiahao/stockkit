const BENEFITS = [
  {
    title: 'Always know your on-hand count',
    body: 'Every restock, waste, and adjustment updates a running balance per product — no more counting shelves to find out what you actually have.',
  },
  {
    title: "See what it's really costing you",
    body: 'Carry a per-unit cost on every product and stockkit rolls it up into your total inventory value automatically.',
  },
  {
    title: 'Nothing gets lost or overwritten',
    body: 'Every stock change is kept as a permanent, append-only record — restock, waste, and adjustment history you can always look back on.',
  },
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h2 className="mb-10 text-center text-3xl font-semibold">Why vendors pick stockkit</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-2xl border p-6">
            <h3 className="text-xl font-semibold">{b.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
