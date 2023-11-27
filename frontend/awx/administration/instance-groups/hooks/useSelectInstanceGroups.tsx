import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useAwxView } from '../../../useAwxView';
import { awxAPI } from '../../../api/awx-utils';
import { useInstanceGroupsFilters } from '../InstanceGroups';
import { useInstanceGroupsColumns } from './useInstanceGroupColumns';

export function useSelectInstanceGroups(isLookup: boolean) {
  const { t } = useTranslation();
  const toolbarFilters = useInstanceGroupsFilters();
  const tableColumns = useInstanceGroupsColumns({ disableLinks: true });
  const columns = useMemo(
    () =>
      isLookup
        ? tableColumns.filter((item) => ['Name', 'Type', 'Total jobs'].includes(item.header))
        : tableColumns,
    [isLookup, tableColumns]
  );
  const view = useAwxView<InstanceGroup>({
    url: awxAPI`/instance_groups/`,
    toolbarFilters,
    tableColumns: columns,
    disableQueryString: true,
  });
  return useSelectDialog<InstanceGroup, true>({
    toolbarFilters,
    tableColumns: columns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
    isMultiple: true,
  });
}
