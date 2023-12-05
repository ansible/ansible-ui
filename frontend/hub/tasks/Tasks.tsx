import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { pulpHrefKeyFn } from '../api/utils';
import { pulpAPI } from '../api/formatPath';
import { usePulpView } from '../usePulpView';
import { Task } from './Task';
import { useTasksToolbarActions } from './hooks/useTasksToolbarActions';
import { useTasksRowActions } from './hooks/useTasksRowActions';
import { useTasksFilters } from './hooks/useTasksFilters';
import { useTasksColumns } from './hooks/useTasksColumns';

export function Tasks() {
  const { t } = useTranslation();
  const toolbarFilters = useTasksFilters();
  const tableColumns = useTasksColumns();
  const view = usePulpView<Task>({
    url: pulpAPI`/tasks/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useTasksToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useTasksRowActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageHeader title={t('Tasks')} />
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
