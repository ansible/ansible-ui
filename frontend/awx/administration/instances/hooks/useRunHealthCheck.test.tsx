import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Instance } from '../../../interfaces/Instance';
import { useRunHealthCheck } from './useRunHealthCheck';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('./useInstancesColumns', () => ({
  useInstancesColumns: vi.fn(() => []),
}));
vi.mock('./useInstanceNameColumn', () => ({
  useInstanceNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

function createMockInstance(overrides: Partial<Instance> = {}): Instance {
  return {
    id: 1,
    hostname: 'instance-a',
    node_type: 'execution',
    health_check_pending: false,
    ...overrides,
  } as Instance;
}

describe('useRunHealthCheck', () => {
  const mockConfirmation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockConfirmation);
  });

  it('opens bulk confirmation to run health checks', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useRunHealthCheck(onComplete));

    result.current([createMockInstance()]);

    expect(mockConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Run health checks on these instances',
        isDanger: false,
        onComplete,
      })
    );
  });

  it('marks non-execution and pending instances as non-actionable', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useRunHealthCheck(onComplete));

    result.current([createMockInstance()]);

    const options = mockConfirmation.mock.calls[0]?.[0] as {
      isItemNonActionable: (item: Instance) => string;
    };

    expect(options.isItemNonActionable(createMockInstance({ node_type: 'control' }))).toContain(
      'execution instances'
    );
    expect(
      options.isItemNonActionable(createMockInstance({ health_check_pending: true }))
    ).toContain('pending health checks');
    expect(options.isItemNonActionable(createMockInstance())).toBe('');
  });
});
