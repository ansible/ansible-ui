import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../../framework';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../../../common/awx-toolbar-filters';

export function useHostsGroupsFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
    [nameToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}
