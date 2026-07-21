'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { navigatingAway, useAsyncAction } from '@/hooks';
import { loginSchema, vendorSchema, type LoginInput } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';
import { completeSignup } from './actions';

type Mode = 'signin' | 'signup';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [stallName, setStallName] = useState('');
  const [stallNameError, setStallNameError] = useState<string | null>(null);
  const { pending: loading, run } = useAsyncAction();
  // Set once we've emailed the user and are waiting on them to confirm the
  // new account before they can sign in.
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginInput) {
    if (mode === 'signup') {
      const parsedName = vendorSchema.safeParse({ name: stallName });
      if (!parsedName.success) {
        setStallNameError(parsedName.error.issues[0]?.message ?? 'Enter your stall name');
        return;
      }
    }
    setStallNameError(null);

    return run(async () => {
      if (mode === 'signup') {
        const { data: result, error } = await supabase.auth.signUp(data);
        if (error) {
          toast.error(error.message);
          return;
        }
        // Email confirmation on → no session yet. Show a "check your email"
        // state instead of bouncing to a dashboard the user can't reach.
        if (!result.session) {
          setSentTo(data.email);
          return;
        }
        const signupResult = await completeSignup(stallName);
        if (!signupResult.success) toast.error(signupResult.error);
        router.push('/dashboard');
        router.refresh();
        await navigatingAway();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) {
        toast.error(error.message);
        return;
      }
      router.push('/dashboard');
      router.refresh();
      await navigatingAway();
    });
  }

  const isSignin = mode === 'signin';

  if (sentTo) {
    return (
      <main className="flex min-h-screen items-center justify-center p-5">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Link href="/" className="text-2xl font-bold tracking-tight">
              <span className="text-primary">stock</span>
              <span>kit</span>
            </Link>
            <CardTitle className="mt-4 text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to{' '}
              <span className="text-foreground font-medium">{sentTo}</span>. Click it to activate
              your account, then sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSentTo(null);
                setMode('signin');
              }}
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight">
            <span className="text-primary">stock</span>
            <span>kit</span>
          </Link>
          <p className="text-muted-foreground mt-1 text-sm">
            Track stock in and out, and know your costs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isSignin ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription>
              {isSignin
                ? 'Sign in to your vendor dashboard.'
                : 'Set up a vendor account in seconds.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="stallName">Stall / business name</Label>
                  <Input
                    id="stallName"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    placeholder="Mama's Kitchen"
                    aria-invalid={!!stallNameError}
                    aria-describedby={stallNameError ? 'stallName-error' : undefined}
                  />
                  {stallNameError && (
                    <p id="stallName-error" className="text-destructive text-sm font-medium">
                      {stallNameError}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-destructive text-sm font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <p id="password-error" className="text-destructive text-sm font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Please wait…' : isSignin ? 'Sign in' : 'Create account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-muted-foreground justify-center border-t pt-6 text-sm">
            {isSignin ? 'New to stockkit? ' : 'Already have an account? '}
            <button
              type="button"
              className="text-primary ml-1 font-semibold underline-offset-4 hover:underline"
              onClick={() => setMode(isSignin ? 'signup' : 'signin')}
            >
              {isSignin ? 'Create an account' : 'Sign in'}
            </button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
