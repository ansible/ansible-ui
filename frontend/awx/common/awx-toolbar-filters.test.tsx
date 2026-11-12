import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useAddressToolbarFilter,
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useEmailToolbarFilter,
  useFirstNameToolbarFilter,
  useGroupTypeToolbarFilter,
  useHostFailedStatusFilter,
  useHostReadyStatusFilter,
  useHostnameToolbarFilter,
  useImageToolbarFilter,
  useInitiatedByToolbarFilter,
  useInventoryTypeToolbarFilter,
  useLabelsToolbarFilter,
  useLastNameToolbarFilter,
  useLaunchedByToolbarFilter,
  useLimitToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
  useSearchToolbarFilter,
  useTemplateTypeToolbarFilter,
  useUsernameToolbarFilter,
} from './awx-toolbar-filters';

vi.mock('@ansible/platform-ui/common/useQueryPlatformOptions', () => ({
  useQueryPlatformOptions: () => ({
    query: vi.fn(),
  }),
}));

describe('awx-toolbar-filters', () => {
  it('useNameToolbarFilter returns name filter config', () => {
    const { result } = renderHook(() => useNameToolbarFilter());
    expect(result.current.key).toBe('name');
    expect(result.current.label).toBe('Name');
  });

  it('useInitiatedByToolbarFilter returns initiated-by filter config', () => {
    const { result } = renderHook(() => useInitiatedByToolbarFilter());
    expect(result.current.key).toBe('initiated-by');
    expect(result.current.query).toBe('actor__username__icontains');
  });

  it('useDescriptionToolbarFilter returns description filter config', () => {
    const { result } = renderHook(() => useDescriptionToolbarFilter());
    expect(result.current.key).toBe('description');
  });

  it('useOrganizationToolbarFilter returns organization filter config', () => {
    const { result } = renderHook(() => useOrganizationToolbarFilter());
    expect(result.current.query).toBe('organization__name__icontains');
  });

  it('useCreatedByToolbarFilter returns created-by filter config', () => {
    const { result } = renderHook(() => useCreatedByToolbarFilter());
    expect(result.current.key).toBe('created-by');
  });

  it('useLaunchedByToolbarFilter returns launched-by filter config', () => {
    const { result } = renderHook(() => useLaunchedByToolbarFilter());
    expect(result.current.key).toBe('launched-by');
  });

  it('useModifiedByToolbarFilter returns modified-by filter config', () => {
    const { result } = renderHook(() => useModifiedByToolbarFilter());
    expect(result.current.key).toBe('modified-by');
  });

  it('useUsernameToolbarFilter returns username filter config', () => {
    const { result } = renderHook(() => useUsernameToolbarFilter());
    expect(result.current.query).toBe('username__icontains');
  });

  it('useFirstNameToolbarFilter returns first name filter config', () => {
    const { result } = renderHook(() => useFirstNameToolbarFilter());
    expect(result.current.key).toBe('firstname');
  });

  it('useLastNameToolbarFilter returns last name filter config', () => {
    const { result } = renderHook(() => useLastNameToolbarFilter());
    expect(result.current.key).toBe('lastname');
  });

  it('useEmailToolbarFilter returns email filter config', () => {
    const { result } = renderHook(() => useEmailToolbarFilter());
    expect(result.current.key).toBe('email');
  });

  it('useInventoryTypeToolbarFilter includes inventory kind options', () => {
    const { result } = renderHook(() => useInventoryTypeToolbarFilter());
    expect(result.current.type).toBe(ToolbarFilterType.MultiSelect);
    if (result.current.type === ToolbarFilterType.MultiSelect) {
      expect(result.current.options).toHaveLength(3);
    }
  });

  it('useGroupTypeToolbarFilter returns group type filter config', () => {
    const { result } = renderHook(() => useGroupTypeToolbarFilter());
    expect(result.current.query).toBe('parents__isnull');
  });

  it('useImageToolbarFilter returns image filter config', () => {
    const { result } = renderHook(() => useImageToolbarFilter());
    expect(result.current.key).toBe('image');
  });

  it('useHostnameToolbarFilter returns hostname filter config', () => {
    const { result } = renderHook(() => useHostnameToolbarFilter());
    expect(result.current.key).toBe('hostname');
  });

  it('useAddressToolbarFilter returns address filter config', () => {
    const { result } = renderHook(() => useAddressToolbarFilter());
    expect(result.current.key).toBe('address');
  });

  it('useTemplateTypeToolbarFilter includes template types', () => {
    const { result } = renderHook(() => useTemplateTypeToolbarFilter());
    if (result.current.type === ToolbarFilterType.MultiSelect) {
      expect(result.current.options.map((option) => option.value)).toEqual([
        'job_template',
        'workflow_job_template',
      ]);
    }
  });

  it('useLabelsToolbarFilter returns async labels filter config', () => {
    const { result } = renderHook(() => useLabelsToolbarFilter());
    expect(result.current.key).toBe('labels');
    expect(result.current.query).toBe('labels__name');
  });

  it('useSearchToolbarFilter returns search filter config', () => {
    const { result } = renderHook(() => useSearchToolbarFilter());
    expect(result.current.key).toBe('search');
  });

  it('useHostFailedStatusFilter returns failed status filter config', () => {
    const { result } = renderHook(() => useHostFailedStatusFilter());
    expect(result.current.key).toBe('failed_status');
  });

  it('useHostReadyStatusFilter returns ready status filter config', () => {
    const { result } = renderHook(() => useHostReadyStatusFilter());
    expect(result.current.key).toBe('ready_status');
  });

  it('useLimitToolbarFilter returns limit filter config', () => {
    const { result } = renderHook(() => useLimitToolbarFilter());
    expect(result.current.key).toBe('limit');
  });
});
