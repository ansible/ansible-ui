import { RedhatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';

export function useHubNamespacesColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<HubNamespace>[]>(
    () => [
      {
        header: t('Name'),
        cell: (namespace) => (
          <TextCell
            text={namespace.name}
            to={getPageUrl(HubRoute.NamespacePage, { params: { id: namespace.name } })}
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
        modal: ColumnModalOption.hidden,
      },
      {
        header: t('Company'),
        type: 'text',
        value: (namespace) => namespace.company ?? undefined,
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}
