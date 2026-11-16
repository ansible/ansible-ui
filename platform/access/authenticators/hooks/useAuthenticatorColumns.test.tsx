import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Authenticator } from '../../../interfaces/Authenticator';
import { useAuthenticatorsColumns } from './useAuthenticatorColumns';

const ldapType = 'ansible_base.authentication.authenticator_plugins.ldap';
const externalOauthType = 'ansible_base.authentication.authenticator_plugins.external_oauth';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => (route: string) => `/mock/${route}`,
  };
});

vi.mock('@ansible/common-ui/columns', () => ({
  useCreatedColumn: () => ({ header: 'Created', type: 'text' }),
  useModifiedColumn: () => ({ header: 'Modified', type: 'text' }),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => ({
    data: {
      authenticators: [
        {
          type: externalOauthType,
          display_name: 'External OAuth API Bearer Token',
          configuration_schema: [],
          documentation_url: '',
        },
        { type: ldapType, display_name: null, configuration_schema: [], documentation_url: '' },
      ],
    },
  }),
}));

describe('useAuthenticatorsColumns', () => {
  it('includes order and name columns with expected headers', () => {
    const { result } = renderHook(() => useAuthenticatorsColumns());
    expect(result.current.map((column) => column.header)).toEqual(
      expect.arrayContaining(['Order', 'Name', 'Authentication type', 'Created', 'Modified'])
    );
    const orderColumn = result.current.find((column) => column.header === 'Order');
    expect(orderColumn?.value?.({ order: 3 } as unknown as Authenticator)).toBe(3);
  });

  it('resolves authentication type labels from plugin display_name when present', () => {
    const { result } = renderHook(() => useAuthenticatorsColumns());
    const typeColumn = result.current.find((column) => column.header === 'Authentication type');

    expect(typeColumn?.value).toBeTypeOf('function');
    expect(typeColumn?.value?.({ type: externalOauthType } as unknown as Authenticator)).toBe(
      'External OAuth API Bearer Token'
    );
    expect(typeColumn?.value?.({ type: ldapType } as unknown as Authenticator)).toBe('LDAP');
  });
});
