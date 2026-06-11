import { PageTable, PageLayoutWithUnauthorized } from '@ansible/ansible-ui-framework';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { filterInsightsBulkActions } from '../../common/isInsights';
import { pulpAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubConfig } from '../../common/useHubConfig';
import { useHubView } from '../../common/useHubView';
import { isAccessDeniedError } from '../../common/utils/errorUtils';
import { Task } from './Task';
import { useTasksColumns } from './hooks/useTasksColumns';
import { useTasksFilters } from './hooks/useTasksFilters';
import { useTasksRowActions } from './hooks/useTasksRowActions';
import { useTasksToolbarActions } from './hooks/useTasksToolbarActions';

export function Tasks() {
  const { t } = useTranslation();
  const toolbarFilters = useTasksFilters();
  const tableColumns = useTasksColumns();
  const config = useHubConfig();
  const docsUrl = useGetDocsUrl(config, 'taskManagement');

  const view = useHubView<Task>({
    url: pulpAPI`/tasks/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const allToolbarActions = useTasksToolbarActions(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo(
    () => filterInsightsBulkActions(allToolbarActions),
    [allToolbarActions]
  );
  const rowActions = useTasksRowActions(view.unselectItemsAndRefresh);

  // Check if the error is a 403 access denied error
  const isUnauthorized = isAccessDeniedError(view.error);

  const description = t(
    'Task management facilitates organizing, scheduling, and monitoring automation tasks for efficient workflow management.'
  );

  return (
    <PageLayoutWithUnauthorized
      isUnauthorized={isUnauthorized}
      resourceName={t('Task Management')}
      title={t('Task Management')}
      description={description}
      titleHelpTitle={t('Task Management')}
      titleHelp={description}
      titleDocLink={docsUrl}
    >
      <PageTable<Task>
        id="hub-tasks-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading tasks')}
        emptyStateTitle={t('No tasks yet')}
        {...view}
        defaultSubtitle={t('Task')}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
      />
    </PageLayoutWithUnauthorized>
  );
}
