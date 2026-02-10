/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaCredentialAddUsers } from './EdaCredentialAddUsers';

describe('EdaCredentialAddUsers', () => {
  it('exports the EdaCredentialAddUsers component', () => {
    expect(EdaCredentialAddUsers).toBeDefined();
    expect(typeof EdaCredentialAddUsers).toBe('function');
  });
});
