import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Authenticator } from '../../../interfaces/Authenticator';
import { useReadableAuthenticatorTypes } from './useReadableAuthenticatorTypes';

const ldapType = 'ansible_base.authentication.authenticator_plugins.ldap';
const externalOauthType = 'ansible_base.authentication.authenticator_plugins.external_oauth';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({
    data: {
      authenticators: [
        { type: ldapType, display_name: null, configuration_schema: [], documentation_url: '' },
        {
          type: externalOauthType,
          display_name: 'External OAuth API Bearer Token',
          configuration_schema: [],
          documentation_url: '',
        },
      ],
    },
  }),
}));

describe('useReadableAuthenticatorTypes', () => {
  it('returns display_name labels when present on the plugins list', () => {
    const authenticators = [
      { type: externalOauthType },
      { type: ldapType },
    ] as unknown as Authenticator[];

    const { result } = renderHook(() => useReadableAuthenticatorTypes(authenticators));

    expect(result.current).toEqual(['External OAuth API Bearer Token', 'LDAP']);
  });

  it('returns an empty list when authenticators are missing', () => {
    const { result } = renderHook(() => useReadableAuthenticatorTypes());

    expect(result.current).toEqual([]);
  });
});
