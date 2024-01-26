import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  useNameToolbarFilter,
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useGroupTypeToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useGroupsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const groupTypeToolbarFilter = useGroupTypeToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      groupTypeToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, groupTypeToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}
