/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContentTypeEnum } from '../../../interfaces/expanded/ContentType';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { useDeleteRoles } from './useDeleteRoles';

let capturedConfig: {
  title?: string;
  items?: HubRbacRole[];
  isItemNonActionable?: (role: HubRbacRole) => string;
} = {};

vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    user: { is_superuser: false },
  }),
}));

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedConfig) => {
    capturedConfig = config;
  },
}));

const baseRole: HubRbacRole = {
  id: 1,
  name: 'galaxy.test',
  description: '',
  managed: false,
  content_type: ContentTypeEnum.Namespace,
  permissions: [],
  modified: '',
  created: '',
  url: '',
  related: { team_assignments: '', user_assignments: '' },
  summary_fields: {},
  modified_by: null,
  created_by: null,
};

describe('useDeleteRoles', () => {
  it('marks built-in roles as non-actionable', () => {
    const { result } = renderHook(() => useDeleteRoles(vi.fn()));
    const deleteRoles = result.current;

    deleteRoles([{ ...baseRole, managed: true }]);

    expect(capturedConfig.isItemNonActionable?.({ ...baseRole, managed: true })).toBe(
      'Built-in roles cannot be deleted.'
    );
  });

  it('blocks deletion for non-superusers', () => {
    const { result } = renderHook(() => useDeleteRoles(vi.fn()));
    const deleteRoles = result.current;

    deleteRoles([baseRole]);

    expect(capturedConfig.isItemNonActionable?.(baseRole)).toContain('permission');
  });
});
