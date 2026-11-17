import {
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useInventoriesGroupsHostsActions } from './useInventoriesGroupsHostsActions';

vi.mock('@ansible/common-ui/crud/usePatchRequest');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

function createMockHost(overrides: Partial<AwxHost> = {}): AwxHost {
  return {
    id: 42,
    name: 'host-1',
    enabled: true,
    summary_fields: {
      user_capabilities: { edit: true, delete: true },
    },
    ...overrides,
  } as AwxHost;
}

describe('useInventoriesGroupsHostsActions', () => {
  const mockPageNavigate = vi.fn();
  const mockPatchRequest = vi.fn().mockResolvedValue({});
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(usePatchRequest).mockReturnValue(mockPatchRequest);
    vi.mocked(useParams).mockReturnValue({
      id: '10',
      inventory_type: 'inventory',
      host_id: '42',
    });
  });

  test('returns enabled switch and edit host actions', () => {
    const { result } = renderHook(() => useInventoriesGroupsHostsActions(mockOnToggle));

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Switch,
      label: 'Enabled',
      selection: PageActionSelection.Single,
    });
    expect(result.current[1]).toMatchObject({
      type: PageActionType.Button,
      label: 'Edit host',
    });
  });

  test('toggle patches host and calls onToggle', async () => {
    const { result } = renderHook(() => useInventoriesGroupsHostsActions(mockOnToggle));
    const host = createMockHost();
    const switchAction = result.current[0];
    if ('onToggle' in switchAction && typeof switchAction.onToggle === 'function') {
      await (switchAction.onToggle as (h: AwxHost, enabled: boolean) => Promise<void>)(host, false);
    }
    expect(mockPatchRequest).toHaveBeenCalledWith(expect.stringContaining('/hosts/42/'), {
      enabled: false,
    });
    expect(mockOnToggle).toHaveBeenCalled();
  });

  test('edit navigates to inventory host edit route', () => {
    const { result } = renderHook(() => useInventoriesGroupsHostsActions(mockOnToggle));
    const host = createMockHost({ id: 99 });
    const editAction = result.current[1];
    if ('onClick' in editAction && typeof editAction.onClick === 'function') {
      (editAction.onClick as (h: AwxHost) => void)(host);
    }
    expect(mockPageNavigate).toHaveBeenCalledWith('awx-inventory-host-edit', {
      params: { id: '10', inventory_type: 'inventory', host_id: 99 },
    });
  });

  test('edit action is hidden for constructed inventory', () => {
    vi.mocked(useParams).mockReturnValue({
      id: '10',
      inventory_type: 'constructed_inventory',
      host_id: '42',
    });
    const { result } = renderHook(() => useInventoriesGroupsHostsActions(mockOnToggle));
    const editAction = result.current[1];
    if ('isHidden' in editAction && typeof editAction.isHidden === 'function') {
      expect((editAction.isHidden as (h: AwxHost) => boolean)(createMockHost())).toBe(true);
    }
  });

  test('switch reflects host enabled state', () => {
    const { result } = renderHook(() => useInventoriesGroupsHostsActions(mockOnToggle));
    const switchAction = result.current[0];
    if ('isSwitchOn' in switchAction && typeof switchAction.isSwitchOn === 'function') {
      expect(
        (switchAction.isSwitchOn as (h: AwxHost) => boolean)(createMockHost({ enabled: true }))
      ).toBe(true);
      expect(
        (switchAction.isSwitchOn as (h: AwxHost) => boolean)(createMockHost({ enabled: false }))
      ).toBe(false);
    }
  });
});
