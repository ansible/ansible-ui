import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
} from '../../../framework';
import { RouteObj } from '../../Routes';
import { StatusCell } from '../../common/Status';
import { usePulpView } from '../usePulpView';
import { Task } from './Task';
import { parsePulpIDFromURL, pulpAPI, pulpHrefKeyFn } from '../api';

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

  return (
    <PageLayout>
      <PageHeader title={t('Tasks')} />
      <PageTable<Task>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading tasks')}
        emptyStateTitle={t('No tasks yet')}
        {...view}
        defaultSubtitle={t('Task')}
      />
    </PageLayout>
  );
}

export function useTasksColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useMemo<ITableColumn<Task>[]>(
    () => [
      {
        header: t('Name'),
        cell: (task) => (
          <TextCell
            text={task.name}
            onClick={() =>
              navigate(
                RouteObj.TaskDetails.replace(':id', parsePulpIDFromURL(task.pulp_href) || '')
              )
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
    [navigate, t]
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
        type: 'string',
        query: 'name__contains',
        comparison: 'contains',
      },
      {
        key: 'status',
        label: t('Status'),
        type: 'string',
        query: 'state',
        comparison: 'equals',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
