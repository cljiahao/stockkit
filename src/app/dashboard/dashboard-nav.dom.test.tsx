// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DashboardNav } from './dashboard-nav';

// No live Supabase project is configured in this environment (see AGENTS.md);
// `publicEnv` throws fast on missing env vars at *import* time, not just when
// a client is constructed — so isolate both the client-side sign-out call
// and the FeedbackForm's server action the same way profile-form.dom.test.tsx
// isolates its server actions, instead of pulling in the real Supabase modules.
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signOut: vi.fn(async () => ({ error: null })) } }),
}));

vi.mock('@/app/actions/feedback', () => ({
  submitFeedbackAction: vi.fn(async () => ({ success: true })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe('DashboardNav', () => {
  it('account menu has Profile, Get help, Feedback, then Sign out, with no Plan item', async () => {
    const user = userEvent.setup();
    render(<DashboardNav vendorName="My Stall" />);
    await user.click(screen.getByRole('button', { name: /account menu/i }));
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.map((item) => item.textContent)).toEqual([
      'Profile',
      'Get help',
      'Feedback',
      'Sign out',
    ]);
  });

  it('has a burger button hidden at sm and up', () => {
    render(<DashboardNav vendorName="My Stall" />);
    const burger = screen.getByRole('button', { name: /open menu/i });
    expect(burger.className).toMatch(/sm:hidden/);
  });
});
