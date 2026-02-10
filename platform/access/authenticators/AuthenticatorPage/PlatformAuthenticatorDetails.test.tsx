/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformAuthenticatorDetails } from './PlatformAuthenticatorDetails';

describe('PlatformAuthenticatorDetails', () => {
  it('exports the PlatformAuthenticatorDetails component', () => {
    expect(PlatformAuthenticatorDetails).toBeDefined();
    expect(typeof PlatformAuthenticatorDetails).toBe('function');
  });
});
