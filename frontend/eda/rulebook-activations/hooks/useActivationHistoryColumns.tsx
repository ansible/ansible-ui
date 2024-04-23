import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimeCell, ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { StatusCell } from '../../../common/Status';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { EdaRoute } from '../../main/EdaRoutes';

export function useActivationHistoryColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaActivationInstance>[]>(
    () => [
      {
        header: t('Name'),
        cell: (instance) => (
          <TextCell
            text={`${instance?.id || ''} - ${instance?.name || ''}`}
            to={getPageUrl(EdaRoute.RulebookActivationInstancePage, {
              params: { id: instance.activation_id || undefined, instanceId: instance.id },
            })}
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
        cell: (instance) => <DateTimeCell value={instance.started_at} />,
      },
    ],
    [getPageUrl, t]
  );
}
