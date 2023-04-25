import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn } from '../../../../framework';
import { EdaActivationInstanceLog } from '../../interfaces/EdaActivationInstanceLog';

export function useActivationInstanceLogsColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaActivationInstanceLog>[]>(
    () => [
      {
        header: t('Line'),
        cell: (record) => record?.line_number,
      },
      {
        header: t('Log'),
        type: 'description',
        value: (record) => record.log,
      },
    ],
    [t]
  );
}
