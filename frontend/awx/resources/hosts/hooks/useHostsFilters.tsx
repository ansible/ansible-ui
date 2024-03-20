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
    let filters: IToolbarFilter[] = [
      nameToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ];

    if (!params.inventory_type || params.inventory_type === 'inventory') {
      filters.splice(1, 0, descriptionToolbarFilter);
    }

    return filters;
  }, [
    nameToolbarFilter,
    descriptionToolbarFilter,
    createdByToolbarFilter,
    modifiedByToolbarFilter,
    params.inventory_type,
  ]);
  return toolbarFilters;
}
