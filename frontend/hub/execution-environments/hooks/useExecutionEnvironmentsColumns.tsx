import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn } from '../../../../framework';

import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function useExecutionEnvironmentsColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();

  const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
    () => [
      {
        header: t('Container repository name'),
        type: 'text',
        value: (executionEnvironment) => executionEnvironment.name,
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      {
        header: t('Description'),
        type: 'text',
        value: (executionEnvironment) => executionEnvironment.description,
        card: 'description',
        list: 'description',
        sort: 'description',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (executionEnvironment) => executionEnvironment.created_at,
        card: 'hidden',
        list: 'secondary',
        sort: 'created_at',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (executionEnvironment) => executionEnvironment.updated_at,
        card: 'hidden',
        list: 'secondary',
        sort: 'updated_at',
      },
    ],
    [t]
  );
  return tableColumns;
}
