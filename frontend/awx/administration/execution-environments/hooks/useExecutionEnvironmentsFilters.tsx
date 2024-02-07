import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
  useImageToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useExecutionEnvironmentsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const organizationToolbarFilter = useOrganizationToolbarFilter();
  const imageToolbarFilter = useImageToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, organizationToolbarFilter, imageToolbarFilter],
    [nameToolbarFilter, organizationToolbarFilter, imageToolbarFilter]
  );
  return toolbarFilters;
}
