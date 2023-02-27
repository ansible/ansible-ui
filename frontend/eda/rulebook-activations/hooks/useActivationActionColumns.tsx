import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateCell, ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaJob } from '../../interfaces/EdaJob';
import { StatusCell } from '../../../common/StatusCell';

export function useActivationActionColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaJob>[]>(
    () => [
      {
        header: t('Name'),
        cell: (job) => (
          <TextCell
            text={job.name || `Job ${job.id}`}
            onClick={() =>
              navigate(RouteObj.EdaRulebookActivationDetails.replace(':id', job.id.toString()))
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Status'),
        cell: (job: EdaJob) => <StatusCell status={job.status} />,
        sort: 'status',
      },
      {
        header: t('Rule'),
        cell: (job) => job?.rule?.name,
        sort: 'rule',
      },
      {
        header: t('Action type'),
        cell: (job) => job.type,
        sort: 'type',
      },
      {
        header: t('Last fired'),
        cell: (job) => <DateCell value={job.fired_at} />,
        sort: 'fired_at',
      },
    ],
    [navigate, t]
  );
}
