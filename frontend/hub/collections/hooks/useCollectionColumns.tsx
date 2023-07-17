import { Label } from '@patternfly/react-core';
import {
  AnsibleTowerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { CollectionVersionSearch } from '../CollectionVersionSearch';

export function useCollectionColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Name'),
        value: (collection) => collection.collection_version?.name,
        cell: (collection) => (
          <TextCell
            text={collection.collection_version?.name}
            to={RouteObj.CollectionDetails.replace(':id', collection.collection_version?.name)}
          />
        ),
        card: 'name',
        list: 'name',
        icon: () => <AnsibleTowerIcon />,
      },
      {
        header: t('Namespace'),
        type: 'text',
        value: (collection) => collection.collection_version.namespace,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (collection) => collection.collection_version.description,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Modules'),
        type: 'count',
        value: (collection) =>
          collection.collection_version.contents.filter((c) => c.content_type === 'module').length,
      },
      {
        header: t('Roles'),
        type: 'count',
        value: (collection) =>
          collection.collection_version.contents.filter((c) => c.content_type === 'TODO').length,
      },
      {
        header: t('Plugins'),
        type: 'count',
        value: (collection) =>
          collection.collection_version.contents.filter((c) => c.content_type === 'TODO').length,
      },
      {
        header: t('Dependencies'),
        type: 'count',
        value: (collection) => Object.keys(collection.collection_version.dependencies).length,
      },
      {
        header: t('Updated'),
        type: 'datetime',
        value: (collection) => collection.collection_version.pulp_created,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Version'),
        type: 'text',
        value: (collection) => collection.collection_version.version,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Signed state'),
        cell: (collection) => {
          switch (collection.collection_version.is_signed) {
            case 'true':
              return (
                <Label icon={<CheckCircleIcon />} variant="outline" color="green">
                  {t('Signed')}
                </Label>
              );
            case 'false':
              return (
                <Label icon={<ExclamationTriangleIcon />} variant="outline" color="orange">
                  {t('Unsigned')}
                </Label>
              );
            default:
              return <></>;
          }
        },
        list: 'secondary',
        value: (collection) => collection.is_signed,
      },
      {
        header: t('Tags'),
        type: 'labels',
        value: (collection) => collection.collection_version.tags.sort(),
      },
    ],
    [t]
  );
}
