import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePageChartColors } from './usePageChartColors';

describe('usePageChartColors', () => {
  it('returns chart color tokens and a default palette', () => {
    const { result } = renderHook(() => usePageChartColors());

    expect(result.current.successfulColor).toContain('--pf-t--chart');
    expect(result.current.failedColor).toContain('--pf-t--chart');
    expect(result.current.chartColors).toHaveLength(8);
    expect(result.current.chartColors.every((c) => c.startsWith('var('))).toBe(true);
  });
});
