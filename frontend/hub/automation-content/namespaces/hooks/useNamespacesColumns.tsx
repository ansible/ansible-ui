import { RedhatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { Namespace } from '../Namespace';

export function useNamespacesColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<Namespace>[]>(
    () => [
      {
        header: t('Namespace'),
        cell: (namespace) => <TextCell text={namespace.name} />,
        value: (namespace) => namespace.name,
        sort: 'name',
        card: 'name',
        list: 'name',
        icon: () => <RedhatIcon />,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (namespace) => namespace.company,
        sort: 'description',
        card: 'description',
        list: 'description',
        icon: () => <RedhatIcon />,
      },
      {
        header: t('Company'),
        type: 'text',
        value: (namespace) => namespace.company,
        sort: 'company',
        list: 'secondary',
        icon: () => <RedhatIcon />,
      },
    ],
    [t]
  );
  return tableColumns;
}
