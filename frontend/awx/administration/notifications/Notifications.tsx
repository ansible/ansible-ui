import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { useNotificationsFilters } from './hooks/useNotificationsFilters';
import { useNotificationsColumns } from './hooks/useNotificationsColumns';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { useAwxView } from '../../common/useAwxView';
import { useNotificationsToolbarActions } from './hooks/useNotificationsToolbarActions';
import { useNotificationsRowActions } from './hooks/useNotificationsRowActions';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';

export function Notifications() {
  const { t } = useTranslation();
  const toolbarFilters = useNotificationsFilters();
  const tableColumns = useNotificationsColumns();
  const view = useAwxView<NotificationTemplate>({
    url: awxAPI`/notification_templates/`,
    toolbarFilters,
    tableColumns,
  });
  const config = useAwxConfig();
  const pageNavigate = usePageNavigate();

  const toolbarActions = useNotificationsToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useNotificationsRowActions(view.unselectItemsAndRefresh);

  const notificationsOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/notification_templates/`
  ).data;
  const canAddNotificationTemplate = Boolean(
    notificationsOptions && notificationsOptions.actions && notificationsOptions.actions['POST']
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Notifications')}
        description={t('Configure custom notifications to be sent based on predefined events.')}
        titleHelpTitle={t('Notifications')}
        titleHelp={t('Configure custom notifications to be sent based on predefined events.')}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/notifications.html`}
        headerActions={<ActivityStreamIcon type={'notification_template'} />}
      />
      <PageTable
        id="awx-host-metrics-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading notifications')}
        emptyStateTitle={
          canAddNotificationTemplate
            ? t('No notifications found.')
            : t('You do not have permission to add notification templates.')
        }
        emptyStateDescription={
          canAddNotificationTemplate
            ? t('Please add notification templates to populate this list.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateButtonText={
          canAddNotificationTemplate ? t('Add notification template') : undefined
        }
        emptyStateButtonClick={
          canAddNotificationTemplate
            ? () => pageNavigate(AwxRoute.AddNotificationTemplate)
            : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
