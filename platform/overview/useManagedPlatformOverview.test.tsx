import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useManagedPlatformOverview } from './useManagedPlatformOverview';

const { mockUseHasAwxService, mockUseHasEdaService, mockUseQuickStarts } = vi.hoisted(() => ({
  mockUseHasAwxService: vi.fn(() => true),
  mockUseHasEdaService: vi.fn(() => true),
  mockUseQuickStarts: vi.fn(() => [{ name: 'create-organization' }]),
}));

vi.mock('../main/GatewayServices', () => ({
  useHasAwxService: mockUseHasAwxService,
  useHasEdaService: mockUseHasEdaService,
}));

vi.mock('./quickstarts/useQuickStarts', () => ({
  useQuickStarts: mockUseQuickStarts,
}));

vi.mock('@ansible/ansible-ui-framework/components/useManagedItems', () => ({
  useManageItems: <T,>(options: { items: T[] }) => ({
    openManageItems: vi.fn(),
    managedItems: options.items,
  }),
}));

describe('useManagedPlatformOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHasAwxService.mockReturnValue(true);
    mockUseHasEdaService.mockReturnValue(true);
    mockUseQuickStarts.mockReturnValue([{ name: 'create-organization' }]);
  });

  test('should include AWX and EDA dashboard resources when both services are available', () => {
    const { result } = renderHook(() => useManagedPlatformOverview());
    const resourceIds = result.current.managedResources.map((item) => item.id);

    expect(resourceIds).toEqual(
      expect.arrayContaining([
        'counts',
        'job_activity',
        'recent_jobs',
        'recent-rulebook-activations',
        'platform-quick-starts',
      ])
    );
  });

  test('should omit AWX resources when AWX service is unavailable', () => {
    mockUseHasAwxService.mockReturnValue(false);
    const { result } = renderHook(() => useManagedPlatformOverview());
    const resourceIds = result.current.managedResources.map((item) => item.id);

    expect(resourceIds).not.toContain('counts');
    expect(resourceIds).toContain('recent-rulebook-activations');
  });

  test('should omit quick starts when no quick starts are defined', () => {
    mockUseQuickStarts.mockReturnValue([]);
    const { result } = renderHook(() => useManagedPlatformOverview());
    const resourceIds = result.current.managedResources.map((item) => item.id);

    expect(resourceIds).not.toContain('platform-quick-starts');
  });
});
