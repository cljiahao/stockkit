import { describe, expect, it } from 'vitest';

import { passwordChangeSchema } from './schemas';

describe('passwordChangeSchema', () => {
  it('accepts matching passwords at least 8 characters long', () => {
    const result = passwordChangeSchema.safeParse({ password: 'hunter22', confirm: 'hunter22' });
    expect(result.success).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = passwordChangeSchema.safeParse({ password: 'short', confirm: 'short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Password must be at least 8 characters');
    }
  });

  it('rejects when confirm does not match password', () => {
    const result = passwordChangeSchema.safeParse({ password: 'hunter22', confirm: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Passwords do not match');
      expect(result.error.issues[0]?.path).toEqual(['confirm']);
    }
  });
});
