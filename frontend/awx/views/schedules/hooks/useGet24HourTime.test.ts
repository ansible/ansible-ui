import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGet24HourTime } from './useGet24HourTime';

describe('useGet24HourTime', () => {
  it('parses valid AM/PM times', () => {
    const { result } = renderHook(() => useGet24HourTime());
    expect(result.current('3:15 PM')).toEqual({ hour: 15, minute: 15 });
  });

  it('throws when AM/PM is missing and includes the entered time in the message', () => {
    const { result } = renderHook(() => useGet24HourTime());
    expect(() => result.current('22:00')).toThrow(/22:00 AM or 22:00 PM/);
  });
});
