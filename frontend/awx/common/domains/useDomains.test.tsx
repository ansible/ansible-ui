import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getTranslatedDomains, useDomainsPersistence, useDomainsStore } from './useDomains';

const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: () => mockGet() as { data?: unknown },
}));

vi.mock('@ansible/common-ui/crud/usePutRequest', () => ({
  usePutRequest: () => mockPut,
}));

describe('useDomainsPersistence', () => {
  const inheritedDomain = { name: 'Shared', labels: [{ name: 'team' }] };
  const userDomain = { name: 'Private', labels: [{ name: 'private' }] };

  beforeEach(() => {
    vi.clearAllMocks();
    useDomainsStore.setState({
      domains: getTranslatedDomains(),
      userDomains: [],
      activeDomains: [],
    });
  });

  test('hydrates effective domains, user-owned domains, and active selections', async () => {
    mockGet.mockReturnValue({
      data: {
        name: 'domains',
        value: {
          domains: [inheritedDomain, userDomain],
          userDomains: [userDomain],
          activeDomains: [inheritedDomain],
        },
      },
    });

    renderHook(() => useDomainsPersistence());

    await waitFor(() => {
      expect(useDomainsStore.getState()).toMatchObject({
        domains: [inheritedDomain, userDomain],
        userDomains: [userDomain],
        activeDomains: [inheritedDomain],
      });
    });
  });

  test('clears persisted state when the API reports no preference', async () => {
    useDomainsStore.setState({
      domains: [inheritedDomain],
      userDomains: [userDomain],
      activeDomains: [inheritedDomain],
    });
    mockGet.mockReturnValue({ data: { name: 'domains', value: null } });

    renderHook(() => useDomainsPersistence());

    await waitFor(() => {
      expect(useDomainsStore.getState()).toMatchObject({
        domains: getTranslatedDomains(),
        userDomains: [],
        activeDomains: [],
      });
    });
  });

  test('persists only user-owned domains and updates state from the effective response', async () => {
    mockGet.mockReturnValue({ data: undefined });
    mockPut.mockResolvedValue({
      name: 'domains',
      value: {
        domains: [inheritedDomain, userDomain],
        userDomains: [userDomain],
        activeDomains: [inheritedDomain],
      },
    });
    const { result } = renderHook(() => useDomainsPersistence());

    await act(async () => {
      await result.current.saveDomains([userDomain], [inheritedDomain]);
    });

    expect(mockPut).toHaveBeenCalledWith('/api/gateway/v1/me/preferences/domains/', {
      value: { domains: [userDomain], activeDomains: [inheritedDomain] },
    });
    expect(useDomainsStore.getState()).toMatchObject({
      domains: [inheritedDomain, userDomain],
      userDomains: [userDomain],
      activeDomains: [inheritedDomain],
    });
  });
});
