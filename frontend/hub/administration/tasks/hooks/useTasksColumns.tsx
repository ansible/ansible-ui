import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageNavigate, ITableColumn, TextCell, DateTimeCell } from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';
import { HubRoute } from '../../../main/HubRoutes';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { Task } from '../Task';

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
        defaultSortDirection: 'desc',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Created'),
        cell: (task) => <DateTimeCell format="since" value={task.pulp_created} />,
        sort: 'pulp_created',
        defaultSort: true,
        defaultSortDirection: 'desc',
        list: 'secondary',
      },
      {
        header: t('Started'),
        cell: (task) => <DateTimeCell format="since" value={task.started_at} />,
        sort: 'started_at',
        defaultSortDirection: 'desc',
        list: 'secondary',
      },
      {
        header: t('Finished'),
        cell: (task) => <DateTimeCell format="since" value={task.finished_at} />,
        sort: 'finished_at',
        defaultSortDirection: 'desc',
        list: 'secondary',
      },
      {
        header: t('Status'),
        cell: (task) => <StatusCell status={task.state} />,
        sort: 'state',
        defaultSortDirection: 'desc',
      },
    ],
    [pageNavigate, t]
  );
  return tableColumns;
}
