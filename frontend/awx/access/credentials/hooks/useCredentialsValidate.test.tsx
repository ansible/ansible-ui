import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialsValidate } from './useCredentialsValidate';

const mockRequestGet = vi.fn<(url: string) => Promise<Credential>>();

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: (url: string) => mockRequestGet(url) as Promise<Credential>,
}));

function buildCredential(
  overrides: Pick<Credential, 'id' | 'name'> &
    Partial<Omit<Credential, 'id' | 'name' | 'summary_fields'>> & {
      summary_fields?: Partial<Credential['summary_fields']>;
    }
): Credential {
  const baseSummary = {
    credential_type: { name: 'Machine', id: 1 },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    object_roles: {
      admin_role: { id: 1, name: 'Admin', description: '' },
      read_role: { id: 2, name: 'Read', description: '' },
      use_role: { id: 3, name: 'Use', description: '' },
    },
    owners: [],
    user_capabilities: { edit: true, delete: true, copy: true, use: true },
  };
  const { summary_fields: summaryOverrides, ...rest } = overrides;
  return {
    kind: 'ssh',
    inputs: {},
    summary_fields: { ...baseSummary, ...summaryOverrides },
    ...rest,
  } as Credential;
}

describe('useCredentialsValidate', () => {
  beforeEach(() => {
    mockRequestGet.mockReset();
  });

  it('returns undefined when credentials are valid', async () => {
    mockRequestGet.mockResolvedValue(
      buildCredential({
        id: 1,
        name: 'cred-a',
        summary_fields: { credential_type: { name: 'Machine', id: 1 } },
      })
    );
    const { result } = renderHook(() => useCredentialsValidate());
    const message = await result.current([
      { id: 1, name: 'cred-a', credential_type: 1, passwords_needed: [] },
    ]);
    expect(message).toBeUndefined();
  });

  it('rejects duplicate non-vault credential types', async () => {
    const first = buildCredential({
      id: 1,
      name: 'a',
      summary_fields: { credential_type: { name: 'Machine', id: 1 } },
    });
    const second = buildCredential({
      id: 2,
      name: 'b',
      summary_fields: { credential_type: { name: 'Machine', id: 1 } },
    });
    const { result } = renderHook(() => useCredentialsValidate());
    const message = await result.current([first, second]);
    expect(message).toMatch(/Duplicated credential types are: Machine/);
  });

  it('rejects duplicate vault ids', async () => {
    const first = buildCredential({
      id: 1,
      name: 'vault-a',
      kind: 'vault',
      inputs: { vault_id: 'dev' },
      summary_fields: { credential_type: { name: 'Vault', id: 2 } },
    });
    const second = buildCredential({
      id: 2,
      name: 'vault-b',
      kind: 'vault',
      inputs: { vault_id: 'dev' },
      summary_fields: { credential_type: { name: 'Vault', id: 2 } },
    });
    const { result } = renderHook(() => useCredentialsValidate());
    const message = await result.current([first, second]);
    expect(message).toMatch(/multiple vault credentials of the same vault id/);
  });

  it('rejects ASK credentials when passwords on launch are prevented', async () => {
    const askCred = buildCredential({
      id: 3,
      name: 'ask-me',
      inputs: { password: 'ASK' },
      summary_fields: { credential_type: { name: 'Machine', id: 1 } },
    });
    const { result } = renderHook(() => useCredentialsValidate(false, true));
    const message = await result.current([askCred]);
    expect(message).toMatch(/require a password: ask-me/);
  });

  it('allows duplicate types when explicitly enabled', async () => {
    const first = buildCredential({
      id: 1,
      name: 'a',
      summary_fields: { credential_type: { name: 'Machine', id: 1 } },
    });
    const second = buildCredential({
      id: 2,
      name: 'b',
      summary_fields: { credential_type: { name: 'Machine', id: 1 } },
    });
    const { result } = renderHook(() => useCredentialsValidate(true));
    const message = await result.current([first, second]);
    expect(message).toBeUndefined();
  });
});
