import { Button, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { IPageAction, ITableColumn, PageTable, useGetPageUrl } from '../../../../../framework';
import { ButtonLink } from '../../../../../framework/components/ButtonLink';
import { PageTableEmptyState } from '../../../../../framework/PageTable/PageTableEmptyState';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
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
