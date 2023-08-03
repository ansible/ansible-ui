import { RedhatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
// routeobj will be used to direct to the edit ns metadata form.
// import { RouteObj } from '../../../Routes';
import { HubNamespaceMetadataType } from '../HubNamespaceMetadataType';
export function useHubNamespaceMetadataColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<HubNamespaceMetadataType>[]>(
    () => [
      {
        header: t('Name'),
        cell: (namespace) => (
          <TextCell
            text={namespace.metadata.name}
            // eventually this routes to the edit form for ns metadata.
            // to={RouteObj.NamespaceDetails.replace(':id', namespace.name)}
          />
        ),
        value: (namespace) => namespace.metadata.name,
        sort: 'name',
        card: 'name',
        list: 'name',
        icon: () => <RedhatIcon />,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (namespace) => namespace.metadata.description ?? undefined,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Repository'),
        type: 'text',
        value: (namespace) => namespace.repository.name ?? undefined,
      },
      {
        header: t('Links'),
        type: 'text',
        value: (namespace) => namespace.metadata.links ?? undefined,
      },
    ],
    [t]
  );
  return tableColumns;
}
