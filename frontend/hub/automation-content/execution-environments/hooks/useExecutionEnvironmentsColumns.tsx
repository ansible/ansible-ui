import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn } from '../../../../../framework';
import { useDescriptionColumn } from '../../../../common/columns';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function useExecutionEnvironmentsColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const descriptionColumn = useDescriptionColumn();
  const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
    () => [
      {
        header: t('Collection repository'),
        type: 'text',
        value: (executionEnvironment) => executionEnvironment.name,
        card: 'name',
        list: 'name',
      },
      descriptionColumn,
      {
        header: t('Created'),
        type: 'datetime',
        value: (executionEnvironment) => executionEnvironment.created_at,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (executionEnvironment) => executionEnvironment.updated_at,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [descriptionColumn, t]
  );
  return tableColumns;
}
