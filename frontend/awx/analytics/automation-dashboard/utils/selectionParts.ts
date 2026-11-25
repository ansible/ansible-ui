import { FilterSelection, normalizeSelection } from './filterSelection';

/** A part of the selection that is shown as one filter chip. */
export type SelectionPart =
  | { type: 'selectAll' }
  | { type: 'id' | 'excluded'; value: string }
  | { type: 'search' | 'excludedSearch'; term: string };

/** The parts of the selection, in the order the chips show them. */
export function getSelectionParts(selection: FilterSelection): SelectionPart[] {
  return [
    ...(selection.selectAll ? [{ type: 'selectAll' } as const] : []),
    ...selection.search.map((term) => ({ type: 'search', term }) as const),
    ...selection.ids.map((value) => ({ type: 'id', value }) as const),
    ...selection.excluded.map((value) => ({ type: 'excluded', value }) as const),
    ...selection.excludedSearch.map((term) => ({ type: 'excludedSearch', term }) as const),
  ];
}

/** A key of the part, unique within the selection. */
export function getSelectionPartKey(part: SelectionPart) {
  if (part.type === 'selectAll') return part.type;
  return `${part.type}:${'value' in part ? part.value : part.term}`;
}

/**
 * The selection without the part (a removed chip). Removing an exclusion selects its options
 * again; removing what selected options also drops the exclusions that no longer apply.
 */
export function removeSelectionPart(
  selection: FilterSelection,
  part: SelectionPart
): FilterSelection {
  const next = { ...selection };
  switch (part.type) {
    case 'selectAll':
      next.selectAll = false;
      break;
    case 'id':
      next.ids = next.ids.filter((id) => id !== part.value);
      break;
    case 'excluded':
      next.excluded = next.excluded.filter((id) => id !== part.value);
      break;
    case 'search':
      next.search = next.search.filter((term) => term !== part.term);
      break;
    case 'excludedSearch':
      next.excludedSearch = next.excludedSearch.filter((term) => term !== part.term);
      break;
  }
  return normalizeSelection(next);
}
