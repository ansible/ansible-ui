import { useTranslation } from 'react-i18next';
import { IPageAction, ITableColumn, PageTable, usePageNavigate } from '../../../../../framework';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { IAwxView, useAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { useInstancesFilters } from '../hooks/useInstancesFilter';
import { useOptions } from '../../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAssociateInstanceToIG } from '../../instance-groups/InstanceGroupPage/hooks/useAssociateInstanceToIG';
import { useAssociateInstanceModal } from '../../instance-groups/InstanceGroupPage/hooks/useAssociateInstanceModal';

export function InstancesList(props: {
  useToolbarActions: (view: IAwxView<Instance>) => IPageAction<Instance>[];
  useRowActions: (onComplete: (instances: Instance[]) => void) => IPageAction<Instance>[];
  tableColumns: ITableColumn<Instance>[];
  instanceGroupId?: string;
}) {
  const toolbarFilters = useInstancesFilters();
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const { useToolbarActions, useRowActions, tableColumns, instanceGroupId } = props;

  const defaultParams: {
    not__node_type: Array<string>;
  } = {
    not__node_type: ['control', 'hybrid'],
  };

  const view = useAwxView<Instance>({
    url: instanceGroupId
      ? awxAPI`/instance_groups/${instanceGroupId}/instances/`
      : awxAPI`/instances/`,
    toolbarFilters,
    tableColumns,
    queryParams: instanceGroupId ? defaultParams : {},
  });

  const rowActions = useRowActions(view.unselectItemsAndRefresh);
  const toolbarActions = useToolbarActions(view);

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    instanceGroupId ? awxAPI`/instance_groups/${instanceGroupId}/instances/` : awxAPI`/instances/`
  );
  const canCreateInstance = Boolean(data && data.actions && data.actions['POST']);

  usePersistentFilters('instances');

  const associateInstance = useAssociateInstanceToIG(
    view.unselectItemsAndRefresh,
    instanceGroupId ?? ''
  );
  const openAssociateInstanceModal = useAssociateInstanceModal();

  return (
    <PageTable<Instance>
      id="awx-instances-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading instances')}
      emptyStateTitle={
        canCreateInstance
          ? t('There are currently no instances added')
          : t('You do not have permission to create an instance.')
      }
      emptyStateDescription={
        canCreateInstance
          ? instanceGroupId
            ? t('Please associate an instance by using the button below.')
            : t('Please create an instance by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={
        canCreateInstance
          ? instanceGroupId
            ? t('Associate instance')
            : t('Create instance')
          : undefined
      }
      emptyStateButtonClick={
        canCreateInstance
          ? instanceGroupId
            ? () =>
                openAssociateInstanceModal({
                  onAssociate: associateInstance,
                  instanceGroupId: instanceGroupId,
                })
            : () => pageNavigate(AwxRoute.AddInstance)
          : undefined
      }
      {...view}
    />
  );
}
