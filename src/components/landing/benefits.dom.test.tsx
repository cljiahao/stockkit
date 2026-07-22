// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Benefits } from './benefits';

afterEach(() => cleanup());

describe('Benefits', () => {
  it('renders all three benefit headings', () => {
    render(<Benefits />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Always know your on-hand count',
      "See what it's really costing you",
      'Nothing gets lost or overwritten',
    ]);
  });
});
