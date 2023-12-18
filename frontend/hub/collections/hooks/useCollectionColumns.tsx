import { Label } from '@patternfly/react-core';
import {
  AnsibleTowerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { CollectionVersionSearch } from '../Collection';

export function useCollectionColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Name'),
        value: (collection) => collection.collection_version?.name,
        cell: (collection) => (
          <TextCell
            text={collection.collection_version?.name}
            to={getPageUrl(HubRoute.CollectionPage, {
              params: {
                name: collection.collection_version?.name,
                namespace: collection.collection_version?.namespace,
                repository: collection.repository?.name,
              },
            })}
          />
        ),
        card: 'name',
        list: 'name',
        icon: () => <AnsibleTowerIcon />,
        sort: 'name',
      },
      {
        header: t('Repository'),
        type: 'text',
        value: (collection) => collection.repository?.name,
      },
      {
        header: t('Namespace'),
        type: 'text',
        value: (collection) => collection.collection_version?.namespace,
        sort: 'namespace',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (collection) => collection.collection_version?.description,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Modules'),
        type: 'count',
        value: (collection) =>
          collection.collection_version?.contents?.filter((c) => c.content_type === 'module')
            .length,
      },
      {
        header: t('Updated'),
        type: 'datetime',
        value: (collection) => collection.collection_version?.pulp_created,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Version'),
        type: 'text',
        value: (collection) => collection.collection_version?.version,
        card: 'hidden',
        list: 'secondary',
        sort: 'version',
      },
      {
        header: t('Signed state'),
        cell: (collection) => {
          switch (collection.is_signed) {
            case true:
              return (
                <Label icon={<CheckCircleIcon />} variant="outline" color="green">
                  {t('Signed')}
                </Label>
              );
            case false:
              return (
                <Label icon={<ExclamationTriangleIcon />} variant="outline" color="orange">
                  {t('Unsigned')}
                </Label>
              );
          }
        },
        list: 'secondary',
        value: (collection) => !collection.is_signed || collection.is_signed,
      },
    ],
    [getPageUrl, t]
  );
}
