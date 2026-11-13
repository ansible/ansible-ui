import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthenticatorMap } from '../../../interfaces/AuthenticatorMap';

const { mockOpenManageItems, mockUseManageItems, mockPatchRequest, mockUseGet } = vi.hoisted(
  () => ({
    mockOpenManageItems: vi.fn(),
    mockUseManageItems: vi.fn(),
    mockPatchRequest: vi.fn(() => Promise.resolve({})),
    mockUseGet: vi.fn(),
  })
);

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useParams: () => ({ id: '7' }),
  };
});

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: mockUseGet,
}));

vi.mock('@ansible/common-ui/crud/usePatchRequest', () => ({
  usePatchRequest: () => mockPatchRequest,
}));

vi.mock('@ansible/ansible-ui-framework/components/useManagedItems', () => ({
  useManageItems: (options: {
    onSubmit: (items: AuthenticatorMap[]) => void;
    keyFn: (map: AuthenticatorMap) => string;
    columns: { cell: (map: AuthenticatorMap) => string }[];
  }) => {
    mockUseManageItems(options);
    return { openManageItems: mockOpenManageItems };
  },
}));

import { useManageMappings } from './useManageMappings';

const mapA = {
  id: 1,
  name: 'Rule A',
  order: 1,
} as AuthenticatorMap;

const mapB = {
  id: 2,
  name: 'Rule B',
  order: 2,
} as AuthenticatorMap;

describe('useManageMappings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGet.mockReturnValue({
      data: { results: [mapA, mapB] },
    });
  });

  test('should expose openManageMappingOrder from useManageItems', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useManageMappings(7, refresh));

    expect(result.current.openManageMappingOrder).toBe(mockOpenManageItems);
    expect(mockUseManageItems).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'authenticator-map-reorder-7',
        items: [mapA, mapB],
      })
    );
  });

  test('should reorder mappings and patch each item on submit', async () => {
    const refresh = vi.fn();
    renderHook(() => useManageMappings(7, refresh));

    const options = mockUseManageItems.mock.calls[0][0] as {
      onSubmit: (items: AuthenticatorMap[]) => void;
      keyFn: (map: AuthenticatorMap) => string;
      columns: { cell: (map: AuthenticatorMap) => string }[];
    };

    expect(options.keyFn(mapA)).toBe('rule-a');
    expect(options.columns[0].cell(mapA)).toBe('Rule A');

    const reordered = [
      { ...mapB, order: 2 },
      { ...mapA, order: 1 },
    ] as AuthenticatorMap[];

    options.onSubmit(reordered);

    await vi.waitFor(() => {
      expect(mockPatchRequest).toHaveBeenCalledTimes(2);
    });

    expect(mockPatchRequest).toHaveBeenNthCalledWith(
      1,
      '/api/gateway/v1/authenticator_maps/2/',
      expect.objectContaining({ order: 1 })
    );
    expect(mockPatchRequest).toHaveBeenNthCalledWith(
      2,
      '/api/gateway/v1/authenticator_maps/1/',
      expect.objectContaining({ order: 2 })
    );

    await vi.waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
  });
});
