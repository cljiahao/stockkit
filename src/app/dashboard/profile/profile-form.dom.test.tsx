// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileForm } from './profile-form';

const updateStallName = vi.fn(async (_input: unknown) => ({ success: true }));
const updateSocialLinks = vi.fn(async (_input: unknown) => ({ success: true }));
vi.mock('./actions', () => ({
  updateStallName: (input: unknown) => updateStallName(input),
  updateSocialLinks: (input: unknown) => updateSocialLinks(input),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

afterEach(() => cleanup());

describe('ProfileForm', () => {
  beforeEach(() => {
    updateStallName.mockClear();
    updateSocialLinks.mockClear();
  });

  it('saves the stall name independently of other sections', async () => {
    const user = userEvent.setup();
    render(<ProfileForm vendorId="v1" stallName="My Stall" socialLinks={{}} />);
    const input = screen.getByLabelText(/stall\/shop name/i);
    await user.clear(input);
    await user.type(input, 'New Name');
    await user.click(screen.getAllByRole('button', { name: /save/i })[0]);
    expect(updateStallName).toHaveBeenCalledWith({ name: 'New Name' });
  });

  it('rejects an empty stall name client-side without calling the server action', async () => {
    const user = userEvent.setup();
    render(<ProfileForm vendorId="v1" stallName="My Stall" socialLinks={{}} />);
    const input = screen.getByLabelText(/stall\/shop name/i);
    await user.clear(input);
    await user.click(screen.getAllByRole('button', { name: /save/i })[0]);
    expect(updateStallName).not.toHaveBeenCalled();
  });

  it('rejects an invalid social link URL client-side without calling the server action', async () => {
    const user = userEvent.setup();
    render(<ProfileForm vendorId="v1" stallName="My Stall" socialLinks={{}} />);
    const input = screen.getByPlaceholderText('website');
    await user.type(input, 'not-a-url');
    await user.click(screen.getAllByRole('button', { name: /save/i })[1]);
    expect(updateSocialLinks).not.toHaveBeenCalled();
  });
});
