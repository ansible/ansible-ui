import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
import { Repository } from '../Repository';

export function useRepositoriesColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<Repository>[]>(
    () => [
      { header: t('Name'), cell: (repository) => <TextCell text={repository.name} /> },
      {
        header: t('Description'),
        cell: (repository) => <TextCell text={repository.description} />,
      },
    ],
    [t]
  );
  return tableColumns;
}
