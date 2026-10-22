import { describe, expect, it } from 'vitest';
import { EMPTY_SELECTION, FilterSelection } from './filterSelection';
import { getSelectionPartKey, getSelectionParts, removeSelectionPart } from './selectionParts';

function selection(overrides: Partial<FilterSelection> = {}): FilterSelection {
  return { ...EMPTY_SELECTION, ...overrides };
}

describe('selection parts', () => {
  const value = selection({ selectAll: true, excluded: ['2'], excludedSearch: ['test'] });

  it('lists the parts with unique keys', () => {
    const parts = getSelectionParts(selection({ ids: ['1'], search: ['a'] }));

    expect(parts).toEqual([
      { type: 'search', term: 'a' },
      { type: 'id', value: '1' },
    ]);
    expect(parts.map(getSelectionPartKey)).toEqual(['search:a', 'id:1']);
    expect(getSelectionParts(value).map(getSelectionPartKey)).toEqual([
      'selectAll',
      'excluded:2',
      'excludedSearch:test',
    ]);
  });

  it('removes an exclusion, selecting its options again', () => {
    expect(removeSelectionPart(value, { type: 'excluded', value: '2' })).toEqual(
      selection({ selectAll: true, excludedSearch: ['test'] })
    );
    expect(removeSelectionPart(value, { type: 'excludedSearch', term: 'test' })).toEqual(
      selection({ selectAll: true, excluded: ['2'] })
    );
  });

  it('drops the exclusions with what selected the options', () => {
    expect(removeSelectionPart(value, { type: 'selectAll' })).toEqual(EMPTY_SELECTION);
    expect(
      removeSelectionPart(selection({ ids: ['1'], search: ['a'] }), { type: 'search', term: 'a' })
    ).toEqual(selection({ ids: ['1'] }));
    expect(removeSelectionPart(selection({ ids: ['1'] }), { type: 'id', value: '1' })).toEqual(
      EMPTY_SELECTION
    );
  });
});
