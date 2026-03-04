/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { CreateCredential } from './CreateCredential';
import { EditCredential } from './EditCredential';

describe('CredentialForm', () => {
  it('exports the CreateCredential component', () => {
    expect(CreateCredential).toBeDefined();
    expect(typeof CreateCredential).toBe('function');
  });

  it('exports the EditCredential component', () => {
    expect(EditCredential).toBeDefined();
    expect(typeof EditCredential).toBe('function');
  });
});
