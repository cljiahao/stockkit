'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SocialLinksInput } from '@/lib/schemas';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateSocialLinks, updateStallName } from './actions';

interface Props {
  vendorId: string;
  stallName: string;
  socialLinks: SocialLinksInput;
}

export function ProfileForm({ stallName, socialLinks }: Props) {
  const [name, setName] = useState(stallName);
  const [namePending, setNamePending] = useState(false);
  const [links, setLinks] = useState(socialLinks);
  const [linksPending, setLinksPending] = useState(false);

  async function saveName() {
    setNamePending(true);
    const res = await updateStallName({ name });
    setNamePending(false);
    if (!res.success) return toast.error(res.error);
    toast.success('Stall name saved');
  }

  async function saveLinks() {
    setLinksPending(true);
    const res = await updateSocialLinks(links);
    setLinksPending(false);
    if (!res.success) return toast.error(res.error);
    toast.success('Links saved');
  }

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start">
      <div className="flex flex-1 flex-col gap-5">
        <section className="rounded-xl border p-4">
          <Label htmlFor="stall-name">Stall/shop name</Label>
          <Input
            id="stall-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2"
          />
          <Button className="mt-3" onClick={saveName} disabled={namePending}>
            {namePending ? 'Saving…' : 'Save'}
          </Button>
        </section>
      </div>
      <div className="flex flex-1 flex-col gap-5">
        <section className="rounded-xl border p-4">
          <Label>Social links</Label>
          <div className="mt-2 space-y-2">
            {(['website', 'instagram', 'facebook', 'tiktok'] as const).map((key) => (
              <Input
                key={key}
                placeholder={key}
                value={links[key] ?? ''}
                onChange={(e) => setLinks({ ...links, [key]: e.target.value })}
              />
            ))}
          </div>
          <Button className="mt-3" onClick={saveLinks} disabled={linksPending}>
            {linksPending ? 'Saving…' : 'Save'}
          </Button>
        </section>
      </div>
    </div>
  );
}
