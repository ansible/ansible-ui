import { describe, expect, it } from 'vitest';
import { credentialKindUsesSshKeyUnlockValidation } from './credentialSshKeyValidation';

describe('credentialKindUsesSshKeyUnlockValidation', () => {
  it('returns true for Machine and Source Control credential kinds', () => {
    expect(credentialKindUsesSshKeyUnlockValidation('ssh')).toBe(true);
    expect(credentialKindUsesSshKeyUnlockValidation('scm')).toBe(true);
  });

  it('returns false for other kinds', () => {
    expect(credentialKindUsesSshKeyUnlockValidation('cloud')).toBe(false);
    expect(credentialKindUsesSshKeyUnlockValidation(undefined)).toBe(false);
  });
});
