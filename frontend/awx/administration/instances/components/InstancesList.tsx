import { IPageAction, ITableColumn, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { PageLoadingTable } from '@ansible/ansible-ui-framework/PageTable/PageLoadingTable';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { IAwxView, useAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAssociateInstanceModal } from '../../instance-groups/InstanceGroupPage/hooks/useAssociateInstanceModal';
import { useAssociateInstanceToIG } from '../../instance-groups/InstanceGroupPage/hooks/useAssociateInstanceToIG';
import { useInstancesFilters } from '../hooks/useInstancesFilter';

export function InstancesList(props: {
  useToolbarActions: (view: IAwxView<Instance>) => IPageAction<Instance>[];
  useRowActions: (onComplete: (instances: Instance[]) => void) => IPageAction<Instance>[];
  tableColumns: ITableColumn<Instance>[];
  instanceGroupId?: string;
}) {
  const toolbarFilters = useInstancesFilters();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { useToolbarActions, useRowActions, tableColumns, instanceGroupId } = props;

  const view = useAwxView<Instance>({
    url: instanceGroupId
      ? awxAPI`/instance_groups/${instanceGroupId}/instances/`
      : awxAPI`/instances/`,
    toolbarFilters,
    tableColumns,
  });

  const rowActions = useRowActions(view.unselectItemsAndRefresh);
  const toolbarActions = useToolbarActions(view);

  const { data, isLoading: isLoadingInstanceOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(instanceGroupId ? awxAPI`/instance_groups/${instanceGroupId}/instances/` : awxAPI`/instances/`);
  const canCreateInstance = Boolean(data && data.actions && data.actions['POST']);

  usePersistentFilters('instances');

  const associateInstance = useAssociateInstanceToIG(
    view.unselectItemsAndRefresh,
    instanceGroupId ?? ''
  );
  const openAssociateInstanceModal = useAssociateInstanceModal();

  let emptyStateTitle = '';
  let emptyStateDescription = '';

  if (canCreateInstance) {
    emptyStateTitle = t('There are currently no instances added');
    emptyStateDescription = instanceGroupId
      ? t('Please associate an instance by using the button below.')
      : t('Please create an instance by using the button below.');
  } else {
    emptyStateTitle = t('You do not have permission to create an instance.');
    emptyStateDescription = t(
      'Please contact your organization administrator if there is an issue with your access.'
    );
  }

  if (isLoadingInstanceOptions) return <PageLoadingTable />;

  return (
    <PageTable<Instance>
      id="awx-instances-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading instances')}
      emptyState={
        canCreateInstance ? (
          <PageTableEmptyState
            title={emptyStateTitle}
            description={emptyStateDescription}
            icon={instanceGroupId ? undefined : PlusCircleIcon}
          >
            {canCreateInstance && instanceGroupId ? (
              <Button
                variant={ButtonVariant.primary}
                icon={<PlusCircleIcon />}
                data-cy="associate-instance"
                data-testid="associate-instance"
                onClick={() =>
                  openAssociateInstanceModal({
                    onAssociate: associateInstance,
                    instanceGroupId: instanceGroupId,
                  })
                }
              >
                {t('Associate instance')}
              </Button>
            ) : (
              <ButtonLink
                variant={ButtonVariant.primary}
                icon={<PlusCircleIcon />}
                data-cy="create-instance"
                data-testid="create-instance"
                href={getPageUrl(AwxRoute.AddInstance)}
              >
                {t('Create instance')}
              </ButtonLink>
            )}
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState title={emptyStateTitle} description={emptyStateDescription} />
        )
      }
      {...view}
    />
  );
}
