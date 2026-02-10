/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { CreateCredentialType, EditCredentialType } from './CredentialTypeForm';

describe('CredentialTypeForm', () => {
  it('exports the CreateCredentialType component', () => {
    expect(CreateCredentialType).toBeDefined();
    expect(typeof CreateCredentialType).toBe('function');
  });

  it('exports the EditCredentialType component', () => {
    expect(EditCredentialType).toBeDefined();
    expect(typeof EditCredentialType).toBe('function');
  });
});
