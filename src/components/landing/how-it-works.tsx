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

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl px-5 py-14">
      <h2 className="mb-10 text-center text-3xl font-semibold">Up and running in three steps</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="rounded-2xl border p-6">
            <p className="text-muted-foreground font-mono text-xs">Step {i + 1}</p>
            <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
