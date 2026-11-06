import { describe, expect, it } from 'vitest';
import { Credential } from '../../../interfaces/Credential';
import { mergeArraysByCredentialType } from './mergeArraysByCredentialType';

describe('mergeArraysByCredentialType', () => {
  it('replaces credentials that share the same credential_type', () => {
    const defaults = [
      { id: 1, credential_type: 10, name: 'old', passwords_needed: [] },
      { id: 2, credential_type: 20, name: 'keep', passwords_needed: [] },
    ];
    const overrides = [
      { id: 99, credential_type: 10, name: 'new' } as Credential,
      { id: 3, credential_type: 30, name: 'added' } as Credential,
    ];

    const merged = mergeArraysByCredentialType(defaults, overrides);

    expect(merged).toHaveLength(3);
    expect(merged.find((c) => c.credential_type === 10)?.name).toBe('new');
    expect(merged.find((c) => c.credential_type === 20)?.name).toBe('keep');
    expect(merged.find((c) => c.credential_type === 30)?.name).toBe('added');
  });

  it('returns a copy when overrides are empty', () => {
    const defaults = [{ id: 1, credential_type: 1, name: 'a', passwords_needed: [] }];
    const merged = mergeArraysByCredentialType(defaults, []);
    expect(merged).toEqual(defaults);
    expect(merged).not.toBe(defaults);
  });
});
