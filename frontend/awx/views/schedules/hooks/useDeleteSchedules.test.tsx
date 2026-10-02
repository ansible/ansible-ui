/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteSchedules } from './useDeleteSchedules';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Schedule } from '../../../interfaces/Schedule';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');
vi.mock('./useSchedulesColumns', () => ({
  useSchedulesColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

function createMockSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 1,
    name: 'Schedule A',
    type: 'schedule',
    summary_fields: {
      user_capabilities: { edit: true, delete: true },
    },
    ...overrides,
  } as Schedule;
}

describe('useDeleteSchedules', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteSchedules(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const schedules = [createMockSchedule(), createMockSchedule({ id: 2, name: 'Schedule B' })];
    const { result } = renderHook(() => useDeleteSchedules(mockOnComplete));

    result.current(schedules);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete schedule/i);
  });

  test('should call bulkAction with correct confirm text including count', () => {
    const schedules = [createMockSchedule(), createMockSchedule({ id: 2, name: 'Schedule B' })];
    const { result } = renderHook(() => useDeleteSchedules(mockOnComplete));

    result.current(schedules);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmText).toContain('2');
  });

  test('should sort schedules by name', () => {
    const schedules = [
      createMockSchedule({ id: 1, name: 'Zulu' }),
      createMockSchedule({ id: 2, name: 'Alpha' }),
    ];
    const { result } = renderHook(() => useDeleteSchedules(mockOnComplete));

    result.current(schedules);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Alpha');
    expect(callArgs.items[1].name).toBe('Zulu');
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteSchedules(mockOnComplete));

    result.current([createMockSchedule()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDeleteSchedules(mockOnComplete));

    result.current([createMockSchedule()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should work without onComplete callback', () => {
    const { result } = renderHook(() => useDeleteSchedules());

    result.current([createMockSchedule()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBeUndefined();
  });

  test('should provide actionFn that calls requestDelete with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteSchedules(mockOnComplete));

    result.current([createMockSchedule({ id: 66 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockSchedule({ id: 66 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(expect.stringContaining('/schedules/66/'), signal);
  });

  test('should pass confirmationColumns and actionColumns', () => {
    const { result } = renderHook(() => useDeleteSchedules(mockOnComplete));

    result.current([createMockSchedule()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmationColumns).toBeDefined();
    expect(callArgs.actionColumns).toBeDefined();
    expect(Array.isArray(callArgs.actionColumns)).toBe(true);
  });
});
