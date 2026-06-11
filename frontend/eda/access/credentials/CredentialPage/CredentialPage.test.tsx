/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { CredentialPage } from './CredentialPage';

describe('CredentialPage', () => {
  it('exports the CredentialPage component', () => {
    expect(CredentialPage).toBeDefined();
    expect(typeof CredentialPage).toBe('function');
  });
});
