import { useMemo } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useInventoryTypeToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useInventoriesFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const inventoryTypeToolbarFilter = useInventoryTypeToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const nameToolbarFilter = useNameToolbarFilter();
  const organizationToolbarFilter = useOrganizationToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      createdByToolbarFilter,
      descriptionToolbarFilter,
      inventoryTypeToolbarFilter,
      modifiedByToolbarFilter,
      organizationToolbarFilter,
    ],
    [
      nameToolbarFilter,
      createdByToolbarFilter,
      descriptionToolbarFilter,
      inventoryTypeToolbarFilter,
      modifiedByToolbarFilter,
      organizationToolbarFilter,
    ]
  );
  return toolbarFilters;
}
