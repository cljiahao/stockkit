// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupportForm } from './support-form';

const { submitSupportMessageActionMock } = vi.hoisted(() => ({
  submitSupportMessageActionMock: vi.fn(),
}));

vi.mock('@/app/actions/support', () => ({
  submitSupportMessageAction: submitSupportMessageActionMock,
}));

beforeEach(() => {
  submitSupportMessageActionMock.mockReset();
});

describe('SupportForm', () => {
  it('shows an error and does not submit when the body is empty', async () => {
    const user = userEvent.setup();
    render(<SupportForm />);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(submitSupportMessageActionMock).not.toHaveBeenCalled();
  });

  it('submits the selected category and typed body, shows a sent confirmation', async () => {
    submitSupportMessageActionMock.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<SupportForm />);

    const form = screen.getAllByTestId('support-form')[0];
    await user.click(screen.getAllByRole('radio', { name: /account/i })[0]);
    await user.type(form.querySelector('textarea') as HTMLTextAreaElement, "Can't sign in.");
    await user.click(screen.getAllByRole('button', { name: /send message/i })[0]);

    await waitFor(() => {
      expect(submitSupportMessageActionMock).toHaveBeenCalledWith({
        category: 'account',
        body: "Can't sign in.",
      });
    });
    await waitFor(() => {
      expect(screen.getByText(/we'll look into this/i)).toBeTruthy();
    });
  });
});
