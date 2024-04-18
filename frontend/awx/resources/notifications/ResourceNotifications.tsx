import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { useNotificationFilters } from './hooks/useNotificationFilters';
import { useNotificationActions } from './hooks/useNotificationActions';
import { useNotificationsColumns } from './hooks/useNotificationColumns';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { useGet } from '../../../common/crud/useGet';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';

interface ResourceTypeMapper {
  inventory_sources?: string;
  projects?: string;
  job_templates?: string;
  workflow_job_templates?: string;
  organizations?: string;
}

export function ResourceNotifications({ resourceType }: { resourceType: string }) {
  const { t } = useTranslation();

  // modify to the specific resource id when adding a new resource that requires the notifications view
  const resourceToParamMap: ResourceTypeMapper = {
    inventory_sources: 'source_id',
    projects: 'id',
    job_templates: 'id',
    workflow_job_templates: 'id',
    organizations: 'id',
  };

  const resourceToErrorMsg: ResourceTypeMapper = {
    inventory_sources: 'inventory source',
    projects: 'project',
    job_templates: 'job template',
    workflow_job_templates: 'workflow job template',
    organizations: 'organization',
  };

  const params = useParams();
  const resourceId = params[resourceToParamMap[resourceType as keyof ResourceTypeMapper] ?? ''];

  const { data: notificationStarted, refresh: notificationStartedRefresh } = useGet<
    AwxItemsResponse<NotificationTemplate>
  >(awxAPI`/${resourceType}/${resourceId ?? ''}/notification_templates_started/`);

  const { data: notificationSuccess, refresh: notificationSuccessRefresh } = useGet<
    AwxItemsResponse<NotificationTemplate>
  >(awxAPI`/${resourceType}/${resourceId ?? ''}/notification_templates_success/`);

  const { data: notificationError, refresh: notificationErrorRefresh } = useGet<
    AwxItemsResponse<NotificationTemplate>
  >(awxAPI`/${resourceType}/${resourceId ?? ''}/notification_templates_error/`);

  const approval = useGet<AwxItemsResponse<NotificationTemplate>>(
    awxAPI`/${resourceType}/${resourceId ?? ''}/notification_templates_approvals/`
  );
  const { data: notificationApproval, refresh: notificationApprovalRefresh } =
    resourceType === 'organizations'
      ? approval
      : { data: { results: [] }, refresh: () => undefined };

  const toolbarFilters = useNotificationFilters();
  const tableColumns = useNotificationsColumns();
  const rowActions = useNotificationActions({
    notificationApproval: notificationApproval?.results,
    notificationApprovalRefresh,
    notificationStarted: notificationStarted?.results,
    notificationStartedRefresh,
    notificationSuccess: notificationSuccess?.results,
    notificationSuccessRefresh,
    notificationError: notificationError?.results,
    notificationErrorRefresh,
    resourceType,
    resourceId,
  });
  const view = useAwxView<NotificationTemplate>({
    url: awxAPI`/notification_templates/`,
    toolbarFilters,
    tableColumns,
  });

  usePersistentFilters('inventories');

  return (
    <PageLayout>
      <PageTable<NotificationTemplate>
        id="awx-inventory-sources-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t(
          `Error loading ${
            resourceToErrorMsg[resourceType as keyof ResourceTypeMapper]
          } notifications`
        )}
        emptyStateTitle={t(
          `There are currently no notifications added to this ${
            resourceToErrorMsg[resourceType as keyof ResourceTypeMapper]
          }.`
        )}
        emptyStateDescription={t(
          'Please contact your organization administrator if there is an issue with your access.'
        )}
        emptyStateIcon={CubesIcon}
        {...view}
      />
    </PageLayout>
  );
}
