import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  useNameToolbarFilter,
  useDescriptionToolbarFilter,
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useParams } from 'react-router-dom';

export function useHostsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();

  const params = useParams<{ inventory_type: string }>();

  const toolbarFilters = useMemo<IToolbarFilter[]>(() => {
    let filters = [nameToolbarFilter, descriptionToolbarFilter, modifiedByToolbarFilter];

    if (params.inventory_type === 'inventory') {
      filters.push(createdByToolbarFilter);
    }
    return filters;
  }, [
    nameToolbarFilter,
    descriptionToolbarFilter,
    createdByToolbarFilter,
    modifiedByToolbarFilter,
  ]);
  return toolbarFilters;
}
