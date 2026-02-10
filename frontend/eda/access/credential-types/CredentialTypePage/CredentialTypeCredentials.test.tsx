/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { CredentialTypeCredentials } from './CredentialTypeCredentials';

describe('CredentialTypeCredentials', () => {
  it('exports the CredentialTypeCredentials component', () => {
    expect(CredentialTypeCredentials).toBeDefined();
    expect(typeof CredentialTypeCredentials).toBe('function');
  });
});
