import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useControllerView } from '../../../useControllerView';
import { useInstanceGroupsColumns, useInstanceGroupsFilters } from '../InstanceGroups';

export function useSelectInstanceGroups() {
  const { t } = useTranslation();
  const toolbarFilters = useInstanceGroupsFilters();
  const tableColumns = useInstanceGroupsColumns({ disableLinks: true });
  const view = useControllerView<InstanceGroup>({
    url: '/api/v2/instance_groups/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<InstanceGroup, true>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
    isMultiple: true,
  });
}
