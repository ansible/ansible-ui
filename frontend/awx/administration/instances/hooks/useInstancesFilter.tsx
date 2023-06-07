import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../../framework';

export function useInstancesFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: 'string',
        query: 'hostname__icontains',
        comparison: 'contains',
      },
      {
        key: 'type',
        label: t('Node type'),
        type: 'select',
        query: 'node_type',
        options: [
          { label: t('Hybrid'), value: 'hybrid' },
          { label: t('Execution'), value: 'execution' },
          { label: t('Control'), value: 'control' },
          { label: t('Hop'), value: 'hop' },
        ],
        placeholder: t('Select types'),
      },
    ],
    [t]
  );
  return toolbarFilters;
}
