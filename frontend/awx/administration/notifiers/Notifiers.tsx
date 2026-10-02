import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import { useNotificationsWatch } from './hooks/useNotificationsWatch';
import { useNotifiersColumns } from './hooks/useNotifiersColumns';
import { useNotifiersFilters } from './hooks/useNotifiersFilters';
import { useNotifiersRowActions } from './hooks/useNotifiersRowActions';
import { useNotifiersToolbarActions } from './hooks/useNotifiersToolbarActions';
import { PageLoadingTable } from '@ansible/ansible-ui-framework/PageTable/PageLoadingTable';

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
  const getPageUrl = useGetPageUrl();

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
  const titleDocLink = useGetDocsUrl(config, 'notifiers');
  const { data, isLoading = true } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/notification_templates/`
  );
  const canAddNotificationTemplate = Boolean(data?.actions?.POST);

  useEffect(() => {
    if (view.pageItems) {
      checkNotifiers(view.pageItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.pageItems]);
  if (isLoading) {
    return <PageLoadingTable />;
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Notifiers')}
        description={t('Configure custom notifications to be sent based on predefined events.')}
        titleHelpTitle={t('Notifiers')}
        titleHelp={t('Configure custom notifications to be sent based on predefined events.')}
        titleDocLink={titleDocLink}
        headerActions={<ActivityStreamIcon type={'notification_template'} />}
      />
      <PageTable
        id="awx-host-metrics-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading notifiers')}
        emptyState={
          canAddNotificationTemplate ? (
            <PageTableEmptyState
              title={t('No notifiers found.')}
              description={t('Create a notifier to populate this list.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(AwxRoute.AddNotificationTemplate)}
              >
                {t('Create notifier')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create notifiers.')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
      />
    </PageLayout>
  );
}
