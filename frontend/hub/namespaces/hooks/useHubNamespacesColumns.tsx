import { ColumnModalOption, ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { RedhatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
        type: 'text',
        value: (namespace) => namespace.name,
        to: (namespace: HubNamespace) => {
          if (_options?.disableLinks) return undefined;
          return getPageUrl(HubRoute.NamespacePage, { params: { id: namespace.name } });
        },
        card: 'name',
        list: 'name',
        sort: _options?.disableSort ? undefined : 'name',
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
    [_options?.disableLinks, _options?.disableSort, getPageUrl, t]
  );
  return tableColumns;
}
