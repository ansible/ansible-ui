import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
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

  const toolbarActions = useNotificationsToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useNotificationsRowActions(view.unselectItemsAndRefresh);

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
        emptyStateTitle={t('No notifications found')}
        emptyStateDescription={t('Please add notification templates to populate this list.')}
        {...view}
      />
    </PageLayout>
  );
}
