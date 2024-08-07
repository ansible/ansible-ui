import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { pulpAPI } from '../../common/api/formatPath';
import { Task } from './Task';
import { useTasksToolbarActions } from './hooks/useTasksToolbarActions';
import { useTasksRowActions } from './hooks/useTasksRowActions';
import { useTasksFilters } from './hooks/useTasksFilters';
import { useTasksColumns } from './hooks/useTasksColumns';
import { useHubView } from '../../common/useHubView';

export function Tasks() {
  const { t } = useTranslation();
  const toolbarFilters = useTasksFilters();
  const tableColumns = useTasksColumns();
  const view = useHubView<Task>({
    url: pulpAPI`/tasks/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useTasksToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useTasksRowActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageHeader
        title={t('Task Management')}
        description={t(
          'Task management facilitates organizing, scheduling, and monitoring automation tasks for efficient workflow management.'
        )}
        titleHelpTitle={t('Task Management')}
        titleHelp={t(
          'Task management facilitates organizing, scheduling, and monitoring automation tasks for efficient workflow management.'
        )}
      />
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
    </PageLayout>
  );
}
