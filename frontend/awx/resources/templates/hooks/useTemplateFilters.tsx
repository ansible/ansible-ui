import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
  useDescriptionToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useTemplateFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}
