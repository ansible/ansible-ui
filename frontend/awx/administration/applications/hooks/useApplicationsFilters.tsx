import { useMemo } from 'react';
import {
  useDescriptionToolbarFilter,
  useNameToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { IToolbarFilter } from '../../../../../framework';

export function useApplicationsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, descriptionToolbarFilter],
    [nameToolbarFilter, descriptionToolbarFilter]
  );
  return toolbarFilters;
}
