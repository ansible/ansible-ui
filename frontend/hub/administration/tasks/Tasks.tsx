import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ElapsedTimeCell,
  ITableColumn,
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  DateTimeCell,
  TextCell,
} from '../../../../framework';
import { useInMemoryView } from '../../../../framework/useInMemoryView';
import { useGet } from '../../../common/crud/useGet';
import { StatusCell } from '../../../common/StatusCell';
import { RouteObj } from '../../../Routes';
import { pulpHRefKeyFn } from '../../useHubView';
import { getIdFromPulpHref } from '../../usePulpView';
import { Task } from './Task';

export function Tasks() {
  const { t } = useTranslation();
  const toolbarFilters = useTaskFilters();
  const tableColumns = useTasksColumns();
  const { data: tasks } = useGet<{ results: Task[] }>('/api/automation-hub/pulp/api/v3/tasks/');
  const view = useInMemoryView<Task>({
    items: tasks?.results,
    keyFn: pulpHRefKeyFn,
    tableColumns,
    toolbarFilters,
  });
  // const view = usePulpView<Task>(
  //   '/api/automation-hub/pulp/api/v3/tasks/',
  //   pulpHRefKeyFn,
  //   toolbarFilters,
  //   tableColumns
  // )
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
              navigate(RouteObj.TaskDetails.replace(':id', getIdFromPulpHref(task.pulp_href)))
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
        list: 'secondary',
      },
      {
        header: t('Finished'),
        cell: (task) => <DateTimeCell format="since" value={task.finished_at} />,
        sort: 'finished_at',
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Created'),
        cell: (task) => <DateTimeCell format="since" value={task.pulp_created} />,
        sort: 'pulp_created',
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
      { key: 'name', label: t('Task name'), type: 'string', query: 'name__contains' },
      { key: 'status', label: t('Status'), type: 'string', query: 'state' },
    ],
    [t]
  );
  return toolbarFilters;
}
