import { describe, expect, it } from 'vitest';
import { EMPTY_SELECTION, FilterSelection, selectEvery } from './filterSelection';
import { getSelectionSummary } from './selectionSummary';

function selection(overrides: Partial<FilterSelection> = {}): FilterSelection {
  return { ...EMPTY_SELECTION, ...overrides };
}

describe('getSelectionSummary', () => {
  it.each<[string, FilterSelection, ReturnType<typeof getSelectionSummary>]>([
    ['nothing', EMPTY_SELECTION, { kind: 'none' }],
    ['every item', selectEvery(), { kind: 'all' }],
    [
      'every item but IDs',
      selection({ selectAll: true, excluded: ['1', '2'] }),
      { kind: 'allExcept', count: 2 },
    ],
    [
      'every item but a term',
      selection({ selectAll: true, excludedSearch: ['a'] }),
      { kind: 'allWithExclusions' },
    ],
    ['the matches of a search', selection({ search: ['a'] }), { kind: 'matching' }],
    ['matches and IDs', selection({ search: ['a'], ids: ['1'] }), { kind: 'custom' }],
    ['IDs', selection({ ids: ['1', '2'] }), { kind: 'count', count: 2 }],
    ['IDs but a term', selection({ ids: ['1', '2'], excludedSearch: ['a'] }), { kind: 'custom' }],
  ])('summarizes %s', (_, value, summary) => {
    expect(getSelectionSummary(value)).toEqual(summary);
  });
});
