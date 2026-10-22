import { TFunction } from 'i18next';
import { Fragment, ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { FilterSelection } from '../utils/filterSelection';
import { getSelectionPartKey, getSelectionParts, SelectionPart } from '../utils/selectionParts';
import { DashboardToolbarFilterLabel } from './DashboardToolbarFilterLabels';

/** A filter chip for a part of the selection. */
export interface SelectionChip extends DashboardToolbarFilterLabel {
  part: SelectionPart;
}

/**
 * The chips of a filter's selection: "All", the search terms, the selected values and the
 * exclusions. `getName` returns the shown name of a value (e.g. an element that loads it).
 */
export function getSelectionChips(
  t: TFunction,
  selection: FilterSelection,
  getName: (value: string) => ReactNode
): SelectionChip[] {
  return getSelectionParts(selection).map((part) => ({
    key: getSelectionPartKey(part),
    part,
    node: getChipNode(t, part, getName),
  }));
}

function getChipNode(t: TFunction, part: SelectionPart, getName: (value: string) => ReactNode) {
  switch (part.type) {
    case 'selectAll':
      return t('All');
    case 'search':
      return t('Matching "{{search}}"', { search: part.term });
    case 'id':
      return getName(part.value);
    case 'excluded': {
      // One translatable text with the name as its component (an element while it loads), so
      // the key is the same for every name.
      const name = <Fragment key="name">{getName(part.value)}</Fragment>;
      return (
        <Trans i18nKey="Except <0/>" defaults="Except <0/>" components={[name]}>
          Except {name}
        </Trans>
      );
    }
    case 'excludedSearch':
      return t('Except matching "{{search}}"', { search: part.term });
  }
}
