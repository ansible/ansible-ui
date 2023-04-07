import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateCell, ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { StatusCell } from '../../../common/StatusCell';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';

export function useActivationHistoryColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaActivationInstance>[]>(
    () => [
      {
        header: t('Name'),
        cell: (instance) => (
          <TextCell
            text={instance.name || `Instance ${instance.id}`}
            onClick={() =>
              navigate(RouteObj.EdaActivationInstanceDetails.replace(':id', instance.id.toString()))
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
        cell: (instance: EdaActivationInstance) => <StatusCell status={instance.status} />,
        sort: 'status',
      },
      {
        header: t('Start date'),
        cell: (instance) => <DateCell value={instance.started_at} />,
        sort: 'started_at',
      },
    ],
    [navigate, t]
  );
}
