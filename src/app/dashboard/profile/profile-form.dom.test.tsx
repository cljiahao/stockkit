// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProfileForm } from './profile-form';

const updateStallName = vi.fn(async (_input: unknown) => ({ success: true }));
vi.mock('./actions', () => ({
  updateStallName: (input: unknown) => updateStallName(input),
  updateSocialLinks: vi.fn(async () => ({ success: true })),
}));

describe('ProfileForm', () => {
  it('saves the stall name independently of other sections', async () => {
    const user = userEvent.setup();
    render(<ProfileForm vendorId="v1" stallName="My Stall" socialLinks={{}} />);
    const input = screen.getByLabelText(/stall\/shop name/i);
    await user.clear(input);
    await user.type(input, 'New Name');
    await user.click(screen.getAllByRole('button', { name: /save/i })[0]);
    expect(updateStallName).toHaveBeenCalledWith({ name: 'New Name' });
  });
});
