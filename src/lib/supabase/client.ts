import { createBrowserClient } from '@supabase/ssr';

import { publicEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/types';

export function createClient() {
  return createBrowserClient<Database, 'stockkit'>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    { db: { schema: 'stockkit' } }
  );
}
