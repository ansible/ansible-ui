import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  useNameToolbarFilter,
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useGroupsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
    [nameToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}
