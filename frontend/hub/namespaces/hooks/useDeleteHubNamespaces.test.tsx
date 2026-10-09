/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HubNamespace } from '../HubNamespace';
import { useDeleteHubNamespaces } from './useDeleteHubNamespaces';

let capturedConfig: { title?: string; alertPrompts?: string[] } = {};

vi.mock('../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedConfig) => {
    capturedConfig = config;
  },
}));

vi.mock('@ansible/common-ui/useInvalidateCache/useInvalidateCache', () => ({
  useClearCache: () => ({ clearCacheByKey: vi.fn() }),
}));

vi.mock('./useHubNamespacesColumns', () => ({
  useHubNamespacesColumns: () => [],
}));

const namespace: HubNamespace = {
  name: 'demo',
  pulp_href: '/ns/1/',
  id: 1,
  company: '',
  email: '',
  avatar_url: '',
  description: '',
  links: [],
  groups: [],
  related_fields: {},
  resources: '',
};

describe('useDeleteHubNamespaces', () => {
  beforeEach(() => {
    capturedConfig = {};
  });

  it('opens bulk confirmation with delete warning', () => {
    const { result } = renderHook(() => useDeleteHubNamespaces(vi.fn()));
    const deleteNamespaces = result.current;

    deleteNamespaces([namespace]);

    expect(capturedConfig.title).toBe('Permanently delete namespaces');
    expect(capturedConfig.alertPrompts?.[0]).toContain('Deleting a namespace');
  });
});
