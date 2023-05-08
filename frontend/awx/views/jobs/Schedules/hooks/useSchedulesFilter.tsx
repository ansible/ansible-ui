import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../../framework';
import {
  useDescriptionToolbarFilter,
  useNameToolbarFilter,
} from '../../../../common/awx-toolbar-filters';

export function useSchedulesFilter() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, descriptionToolbarFilter],
    [nameToolbarFilter, descriptionToolbarFilter]
  );
  return toolbarFilters;
}
