import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useGetDocsUrl } from '../../common/util/useGetDocsUrl';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { useNotifiersFilters } from './hooks/useNotifiersFilters';
import { useNotifiersColumns } from './hooks/useNotifiersColumns';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { useAwxView } from '../../common/useAwxView';
import { useNotifiersToolbarActions } from './hooks/useNotifiersToolbarActions';
import { useNotifiersRowActions } from './hooks/useNotifiersRowActions';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useNotificationsWatch } from './hooks/useNotificationsWatch';
import { useEffect } from 'react';

export function Notifiers() {
  const { t } = useTranslation();
  const { runningNotifications, onNotifierStartTest, checkNotifiers } = useNotificationsWatch();
  const toolbarFilters = useNotifiersFilters();
  const tableColumns = useNotifiersColumns({ runningNotifications });
  const view = useAwxView<NotificationTemplate>({
    url: awxAPI`/notification_templates/`,
    toolbarFilters,
    tableColumns,
  });
  const config = useAwxConfig();
  const pageNavigate = usePageNavigate();

  const toolbarActions = useNotifiersToolbarActions(view.unselectItemsAndRefresh);

  const rowActions = useNotifiersRowActions({
    onComplete: view.unselectItemsAndRefresh,
    onNotifierCopied: () => {
      void view.refresh();
    },
    onNotifierStartTest,
    type: 'list',
    runningNotifications,
  });

  const notificationsOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/notification_templates/`
  ).data;
  const canAddNotificationTemplate = Boolean(
    notificationsOptions && notificationsOptions.actions && notificationsOptions.actions['POST']
  );

  useEffect(() => {
    if (view.pageItems) {
      checkNotifiers(view.pageItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.pageItems]);

  return (
    <PageLayout>
      <PageHeader
        title={t('Notifiers')}
        description={t('Configure custom notifications to be sent based on predefined events.')}
        titleHelpTitle={t('Notifiers')}
        titleHelp={t('Configure custom notifications to be sent based on predefined events.')}
        titleDocLink={useGetDocsUrl(config, 'notifiers')}
        headerActions={<ActivityStreamIcon type={'notification_template'} />}
      />
      <PageTable
        id="awx-host-metrics-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading notifiers')}
        emptyStateTitle={
          canAddNotificationTemplate
            ? t('No notifiers found.')
            : t('You do not have permission to add notifiers.')
        }
        emptyStateDescription={
          canAddNotificationTemplate
            ? t('Please add notifiers to populate this list.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canAddNotificationTemplate ? t('Add notifier') : undefined}
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
