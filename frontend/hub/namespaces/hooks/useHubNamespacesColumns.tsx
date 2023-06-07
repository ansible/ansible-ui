import { RedhatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { HubNamespace } from '../HubNamespace';

export function useHubNamespacesColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<HubNamespace>[]>(
    () => [
      {
        header: t('Name'),
        cell: (namespace) => (
          <TextCell
            text={namespace.name}
            to={RouteObj.NamespaceDetails.replace(':id', namespace.name)}
          />
        ),
        value: (namespace) => namespace.name,
        sort: 'name',
        card: 'name',
        list: 'name',
        icon: () => <RedhatIcon />,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (namespace) => namespace.description ?? undefined,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Company'),
        type: 'text',
        value: (namespace) => namespace.company ?? undefined,
        list: 'secondary',
      },
    ],
    [t]
  );
  return tableColumns;
}
