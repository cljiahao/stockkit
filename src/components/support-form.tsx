'use client';
import { submitSupportMessageAction } from '@/app/actions/support';
import { Button } from '@/components/ui/button';
import type { SupportMessageInput } from '@/lib/schemas';
import { SUPPORT_CATEGORY_LABELS, supportMessageSchema } from '@/lib/schemas';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

/** Vendor support message widget, similar to FeedbackForm but for categorized
 *  support requests. Designed to be mounted in a Sheet off the account menu. */
export function SupportForm() {
  const [category, setCategory] = useState<SupportMessageInput['category']>('products');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  function send() {
    if (!body.trim()) {
      toast.error("Tell us what's wrong");
      return;
    }
    const parsed = supportMessageSchema.safeParse({
      category,
      body: body.trim(),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid message');
      return;
    }
    start(async () => {
      const res = await submitSupportMessageAction(parsed.data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border px-4 py-3 text-center text-sm">
        We&apos;ll look into this and get back to you soon.
      </div>
    );
  }

  return (
    <div className="bg-card space-y-4 rounded-xl border p-4" data-testid="support-form">
      <div className="space-y-2">
        <p className="text-sm font-medium">What&apos;s the issue?</p>
        <div className="space-y-2" role="radiogroup" aria-label="Issue category">
          {(Object.keys(SUPPORT_CATEGORY_LABELS) as SupportMessageInput['category'][]).map(
            (cat, idx) => {
              const id = `category-${idx}`;
              return (
                <label
                  key={cat}
                  htmlFor={id}
                  className="hover:bg-secondary/50 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
                >
                  <input
                    id={id}
                    type="radio"
                    name="category"
                    value={cat}
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                    className="size-4 cursor-pointer"
                  />
                  <span className="text-sm">{SUPPORT_CATEGORY_LABELS[cat]}</span>
                </label>
              );
            }
          )}
        </div>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-label="Describe the problem"
        placeholder="Describe the problem..."
        rows={4}
        maxLength={2000}
        className="bg-background focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
      />
      <Button
        type="button"
        className="h-11 w-full rounded-xl font-semibold"
        onClick={send}
        disabled={pending}
      >
        {pending ? 'Sending…' : 'Send message'}
      </Button>
    </div>
  );
}
