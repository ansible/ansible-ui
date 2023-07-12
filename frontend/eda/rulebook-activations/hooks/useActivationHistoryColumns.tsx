import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateCell, ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { StatusCell } from '../../../common/Status';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';

export function useActivationHistoryColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaActivationInstance>[]>(
    () => [
      {
        header: t('Name'),
        cell: (instance) => (
          <TextCell
            text={`${instance?.id || ''} - ${instance?.name || ''}`}
            to={RouteObj.EdaActivationInstanceDetails.replace(':id', instance.id.toString())}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (instance: EdaActivationInstance) => <StatusCell status={instance.status} />,
      },
      {
        header: t('Start date'),
        cell: (instance) => <DateCell value={instance.started_at} />,
      },
    ],
    [t]
  );
}
