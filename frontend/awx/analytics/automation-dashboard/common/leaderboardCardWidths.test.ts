import { describe, expect, test } from 'vitest';
import {
  CARD_WIDTH_COL_SPAN,
  getTopRowColSpan,
  NARROW_GRID_MAX_COLUMNS,
  widthOrFullRow,
} from './leaderboardCardWidths';

describe('getTopRowColSpan', () => {
  test('should clamp to the grid width, up to the full xxl span (24)', () => {
    expect(getTopRowColSpan(1)).toBe(1);
    expect(getTopRowColSpan(12)).toBe(12);
    expect(getTopRowColSpan(24)).toBe(24);
    expect(getTopRowColSpan(32)).toBe(24);
  });
});

describe('widthOrFullRow', () => {
  test(`should fall back to xxl at or below ${NARROW_GRID_MAX_COLUMNS} columns`, () => {
    expect(widthOrFullRow(1, 'md')).toBe('xxl');
    expect(widthOrFullRow(NARROW_GRID_MAX_COLUMNS, 'lg')).toBe('xxl');
  });

  test(`should use the given width above ${NARROW_GRID_MAX_COLUMNS} columns`, () => {
    expect(widthOrFullRow(NARROW_GRID_MAX_COLUMNS + 1, 'md')).toBe('md');
    expect(widthOrFullRow(24, 'lg')).toBe('lg');
    expect(widthOrFullRow(48, 'lg')).toBe('lg');
  });

  test('should only ever return the given width or xxl', () => {
    [1, 8, 14, 15, 16, 24, 48].forEach((gridColumns) => {
      const result = widthOrFullRow(gridColumns, 'md');
      expect(['md', 'xxl']).toContain(result);
      expect(CARD_WIDTH_COL_SPAN[result]).toBeGreaterThan(0);
    });
  });
});
