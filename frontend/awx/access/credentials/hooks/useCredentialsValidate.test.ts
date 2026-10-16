import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCredentialsValidate } from './useCredentialsValidate';

describe('useCredentialsValidate', () => {
  it('ignores vault credentials without a vault id', async () => {
    const { result } = renderHook(() => useCredentialsValidate());
    const credential = {
      id: 1,
      kind: 'vault',
      inputs: {},
      summary_fields: { credential_type: { name: 'Vault' } },
    };

    await expect(result.current([credential] as never)).resolves.toBeUndefined();
  });

  it('accepts a vault credential with a vault id', async () => {
    const { result } = renderHook(() => useCredentialsValidate());
    const credential = {
      id: 1,
      kind: 'vault',
      inputs: { vault_id: 'vault-1' },
      summary_fields: { credential_type: { name: 'Vault' } },
    };

    await expect(result.current([credential] as never)).resolves.toBeUndefined();
  });
});
