// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LedgerCardPreview } from './ledger-card-preview';

afterEach(() => cleanup());

describe('LedgerCardPreview', () => {
  it('renders the mock product name, on-hand count, unit cost, and a recent movement', () => {
    render(<LedgerCardPreview />);
    expect(screen.getByText('Whole Bean Coffee 1kg')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('$18.50')).toBeTruthy();
    expect(screen.getByText('+12 restock')).toBeTruthy();
  });
});
