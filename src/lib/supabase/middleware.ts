import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { publicEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/types';

// Only /dashboard needs a session for v1; everything else (the landing page,
// the login page) is public.
function isProtectedPath(path: string): boolean {
  return path.startsWith('/dashboard');
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database, 'stockkit'>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      db: { schema: 'stockkit' },
    }
  );

  // Public routes are hot — don't spend an auth round-trip (or risk an auth-
  // outage 500) on them. Only protected routes resolve the user.
  if (!isProtectedPath(request.nextUrl.pathname)) return supabaseResponse;

  let user: User | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth unreachable — degrade to "unauthenticated" and redirect to /login
    // rather than 500-ing a protected route.
    user = null;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
