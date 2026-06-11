import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useActivationHistoryFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.MultiSelect,
        query: 'status',
        options: [
          { label: t('Starting'), value: 'starting' },
          { label: t('Running'), value: 'running' },
          { label: t('Pending'), value: 'pending' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Stopping'), value: 'stopping' },
          { label: t('Stopped'), value: 'stopped' },
          { label: t('Completed'), value: 'completed' },
          { label: t('Unresponsive'), value: 'unresponsive' },
        ],
        placeholder: t('Select statuses'),
      },
    ],
    [t]
  );
}
