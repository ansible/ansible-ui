/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { AuthenticatorsList } from './AuthenticatorsList';

describe('AuthenticatorsList', () => {
  it('exports the AuthenticatorsList component', () => {
    expect(AuthenticatorsList).toBeDefined();
    expect(typeof AuthenticatorsList).toBe('function');
  });
});
