'use server';
import type { ActionResult } from '@/lib/action-result';
import { feedbackSchema, type FeedbackInput } from '@/lib/schemas';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Submit vendor NPS feedback for stockkit. Inserted via the session client —
 * the feedback_self_insert RLS policy (migration 0004) is the authorization
 * boundary.
 */
export async function submitFeedbackAction(input: FeedbackInput): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid feedback',
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Please sign in first' };

  const { error } = await supabase.from('feedback').insert({
    vendor_id: user.id,
    nps: parsed.data.nps,
    message: parsed.data.message ?? null,
  });
  if (error) {
    console.error('submitFeedbackAction failed', error.message);
    return { success: false, error: 'Could not send feedback' };
  }
  return { success: true };
}
