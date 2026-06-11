/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { AuthenticatorPage } from './AuthenticatorPage';

describe('AuthenticatorPage', () => {
  it('exports the AuthenticatorPage component', () => {
    expect(AuthenticatorPage).toBeDefined();
    expect(typeof AuthenticatorPage).toBe('function');
  });
});
