/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteHosts } from './useDeleteHosts';
import { useDisassociateHosts } from './useDisassociateHosts';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { AwxHost } from '../../../interfaces/AwxHost';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');
vi.mock('./useHostsColumns', () => ({
  useHostsColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ group_id: '42' })),
  };
});

function createMockHost(overrides: Partial<AwxHost> = {}): AwxHost {
  return {
    id: 1,
    name: 'Host A',
    created: '2025-01-01T00:00:00Z',
    modified: '2025-01-01T00:00:00Z',
    summary_fields: {
      groups: { count: 1, results: [{ id: 1, name: 'Group 1' }] },
      user_capabilities: { edit: true, delete: true },
      recent_jobs: [],
    },
    ...overrides,
  } as AwxHost;
}

describe('useDeleteHosts', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteHosts(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const hosts = [createMockHost(), createMockHost({ id: 2, name: 'Host B' })];
    const { result } = renderHook(() => useDeleteHosts(mockOnComplete));

    result.current(hosts);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete hosts/i);
  });

  test('should call bulkAction with correct confirm text including count', () => {
    const hosts = [createMockHost(), createMockHost({ id: 2, name: 'Host B' })];
    const { result } = renderHook(() => useDeleteHosts(mockOnComplete));

    result.current(hosts);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmText).toContain('2');
  });

  test('should sort hosts by name', () => {
    const hosts = [
      createMockHost({ id: 1, name: 'Zebra' }),
      createMockHost({ id: 2, name: 'Alpha' }),
    ];
    const { result } = renderHook(() => useDeleteHosts(mockOnComplete));

    result.current(hosts);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Alpha');
    expect(callArgs.items[1].name).toBe('Zebra');
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteHosts(mockOnComplete));

    result.current([createMockHost()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDeleteHosts(mockOnComplete));

    result.current([createMockHost()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should provide actionFn that calls requestDelete with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteHosts(mockOnComplete));

    result.current([createMockHost({ id: 99 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockHost({ id: 99 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(expect.stringContaining('/hosts/99/'), signal);
  });

  test('should pass confirmationColumns and actionColumns', () => {
    const { result } = renderHook(() => useDeleteHosts(mockOnComplete));

    result.current([createMockHost()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmationColumns).toBeDefined();
    expect(callArgs.actionColumns).toBeDefined();
    expect(Array.isArray(callArgs.actionColumns)).toBe(true);
  });
});

describe('useDisassociateHosts', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a disassociate function', () => {
    const { result } = renderHook(() => useDisassociateHosts(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const hosts = [createMockHost()];
    const { result } = renderHook(() => useDisassociateHosts(mockOnComplete));

    result.current(hosts);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/disassociate host from group/i);
  });

  test('should call bulkAction with correct confirm text', () => {
    const hosts = [createMockHost(), createMockHost({ id: 2, name: 'Host B' })];
    const { result } = renderHook(() => useDisassociateHosts(mockOnComplete));

    result.current(hosts);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmText).toContain('2');
  });

  test('should sort hosts by name', () => {
    const hosts = [
      createMockHost({ id: 1, name: 'Zulu' }),
      createMockHost({ id: 2, name: 'Bravo' }),
    ];
    const { result } = renderHook(() => useDisassociateHosts(mockOnComplete));

    result.current(hosts);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Bravo');
    expect(callArgs.items[1].name).toBe('Zulu');
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDisassociateHosts(mockOnComplete));

    result.current([createMockHost()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDisassociateHosts(mockOnComplete));

    result.current([createMockHost()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should provide actionFn that calls postRequest with disassociate payload', async () => {
    const { postRequest } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(postRequest).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDisassociateHosts(mockOnComplete));

    result.current([createMockHost({ id: 55 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockHost({ id: 55 }), signal);

    expect(postRequest).toHaveBeenCalledWith(
      expect.stringContaining('/groups/42/hosts/'),
      { disassociate: true, id: 55 },
      signal
    );
  });
});
