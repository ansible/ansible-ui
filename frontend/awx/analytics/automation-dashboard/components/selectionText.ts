import { TFunction } from 'i18next';
import { FilterSelection } from '../utils/filterSelection';
import { getSelectionSummary } from '../utils/selectionSummary';

/**
 * The selection state the toggle of a filter select shows; '' for no selection (the placeholder
 * is shown then).
 */
export function getSelectionSummaryText(t: TFunction, selection: FilterSelection) {
  const summary = getSelectionSummary(selection);
  switch (summary.kind) {
    case 'none':
      return '';
    case 'all':
      return t('All selected');
    case 'allExcept':
      return t('All except {{count}}', { count: summary.count });
    case 'allWithExclusions':
      return t('All with exclusions');
    case 'matching':
      // The count of the matches is not known without loading them.
      return t('All matching');
    case 'custom':
      return t('Custom selection');
    case 'count':
      return t('{{count}} selected', { count: summary.count });
  }
}
