// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Faq } from './faq';

afterEach(() => cleanup());

describe('Faq', () => {
  it('renders every question', () => {
    render(<Faq />);
    expect(screen.getByText('Does stockkit track sales automatically?')).toBeTruthy();
    expect(screen.getByText('What counts as a stock movement?')).toBeTruthy();
    expect(screen.getByText('Is there a free plan?')).toBeTruthy();
  });
});
