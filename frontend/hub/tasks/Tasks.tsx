import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnTableOption,
  DateTimeCell,
  ElapsedTimeCell,
  ITableColumn,
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  ToolbarFilterType,
  usePageNavigate,
} from '../../../framework';
import { StatusCell } from '../../common/Status';
import { HubRoute } from '../HubRoutes';
import { parsePulpIDFromURL, pulpAPI, pulpHrefKeyFn } from '../api/utils';
import { usePulpView } from '../usePulpView';
import { Task } from './Task';
import { useTasksActions } from './hooks/useTasksActions';
import { useTaskActions } from './hooks/useTaskActions';

export function Tasks() {
  const { t } = useTranslation();
  const toolbarFilters = useTaskFilters();
  const tableColumns = useTasksColumns();
  const view = usePulpView<Task>({
    url: pulpAPI`/tasks/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useTasksActions(view.unselectItemsAndRefresh);
  const rowActions = useTaskActions(view.unselectItemsAndRefresh);

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

export function useTasksColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const tableColumns = useMemo<ITableColumn<Task>[]>(
    () => [
      {
        header: t('Name'),
        cell: (task) => (
          <TextCell
            text={task.name}
            onClick={() =>
              pageNavigate(HubRoute.TaskPage, {
                params: { id: parsePulpIDFromURL(task.pulp_href) || '' },
              })
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (task) => <StatusCell status={task.state} />,
        sort: 'state',
      },
      {
        header: t('Duration'),
        cell: (task) => <ElapsedTimeCell start={task.started_at} finish={task.finished_at} />,
      },
      {
        header: t('Started'),
        cell: (task) => <DateTimeCell format="since" value={task.started_at} />,
        sort: 'started_at',
        defaultSortDirection: 'desc',
        table: ColumnTableOption.Expanded,
        list: 'secondary',
      },
      {
        header: t('Finished'),
        cell: (task) => <DateTimeCell format="since" value={task.finished_at} />,
        sort: 'finished_at',
        defaultSortDirection: 'desc',
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Created'),
        cell: (task) => <DateTimeCell format="since" value={task.pulp_created} />,
        sort: 'pulp_created',
        defaultSortDirection: 'desc',
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [pageNavigate, t]
  );
  return tableColumns;
}

export function useTaskFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Task name'),
        type: ToolbarFilterType.Text,
        query: 'name__contains',
        comparison: 'contains',
      },
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.Text,
        query: 'state',
        comparison: 'equals',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
