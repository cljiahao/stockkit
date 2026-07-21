'use server';

import type { ActionResult } from '@/lib/action-result';
import { getOrCreateVendorProfile, upsertVendorProfile } from '@/lib/merqo-vendor-profile';
import {
  profileNameSchema,
  socialLinksSchema,
  type ProfileNameInput,
  type SocialLinksInput,
} from '@/lib/schemas';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Update the vendor's shared stall name. Persisted in merqo.vendor_profile
 * (shared across every kit — docs/business/2026-07-21-profile-settings-page-standard.md)
 * via the upsert_vendor_profile RPC, not stockkit's local vendors.name.
 */
export async function updateStallName(input: ProfileNameInput): Promise<ActionResult> {
  const parsed = profileNameSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid stall name',
    };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not signed in' };

  try {
    const current = await getOrCreateVendorProfile(supabase, user.id, null);
    await upsertVendorProfile(supabase, user.id, parsed.data.name, current.social_links);
  } catch (err) {
    console.error('updateStallName failed', err instanceof Error ? err.message : err);
    return { success: false, error: 'Could not save stall name' };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

/** Update the vendor's profile-level social links. Same write path as updateStallName. */
export async function updateSocialLinks(input: SocialLinksInput): Promise<ActionResult> {
  const parsed = socialLinksSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid links',
    };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not signed in' };

  try {
    const current = await getOrCreateVendorProfile(supabase, user.id, null);
    await upsertVendorProfile(supabase, user.id, current.stall_name, parsed.data);
  } catch (err) {
    console.error('updateSocialLinks failed', err instanceof Error ? err.message : err);
    return { success: false, error: 'Could not save links' };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
}
