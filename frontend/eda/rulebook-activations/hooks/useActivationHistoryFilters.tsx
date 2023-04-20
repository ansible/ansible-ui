import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../framework';

export function useActivationHistoryFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'status',
        label: t('Status'),
        type: 'select',
        query: 'status',
        options: [
          { label: t('New'), value: 'new' },
          { label: t('Pending'), value: 'pending' },
          { label: t('Waiting'), value: 'waiting' },
          { label: t('Running'), value: 'running' },
          { label: t('Success'), value: 'success' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Error'), value: 'error' },
          { label: t('Canceled'), value: 'canceled' },
        ],
        placeholder: t('Select statuses'),
      },
    ],
    [t]
  );
}
