import { Label } from '@patternfly/react-core';
import {
  AnsibleTowerIcon,
  BanIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnCardOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../framework';
import { useHubContext } from '../../common/useHubContext';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useParams } from 'react-router-dom';

export function useCollectionColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { namespace, name, repository } = useParams<{
    namespace?: string;
    name?: string;
    repository?: string;
  }>();

  const context = useHubContext();
  const { display_signatures } = context.featureFlags;
  return useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Name'),
        value: (collection) => collection.collection_version?.name,
        cell: (collection) => {
          return (
            <>
              <TextCell
                text={collection.collection_version?.name}
                to={
                  name || namespace || repository
                    ? undefined
                    : getPageUrl(HubRoute.CollectionPage, {
                        params: {
                          name: collection.collection_version?.name,
                          namespace: collection.collection_version?.namespace,
                          repository: collection.repository?.name,
                        },
                      })
                }
              />
              {collection.is_deprecated && (
                <Label icon={<BanIcon />} color="red" variant="outline">
                  {t('Deprecated')}
                </Label>
              )}
            </>
          );
        },
        card: 'name',
        list: 'name',
        icon: () => <AnsibleTowerIcon />,
        sort: 'name',
      },
      {
        header: t('Provided by'),
        type: 'text',
        value: (collection) =>
          t(`Provided by {{namespace}}`, { namespace: collection.collection_version?.namespace }),
        card: 'subtitle',
        list: 'subtitle',
        table: 'hidden',
      },
      {
        header: t('Repository'),
        value: (collection) => collection.repository?.name,
        cell: (collection) => (
          <TextCell
            text={collection.repository?.name}
            to={getPageUrl(HubRoute.RepositoryDetails, {
              params: {
                id: collection.repository?.name,
              },
            })}
          />
        ),
      },
      {
        header: t('Namespace'),
        value: (collection) => collection.collection_version?.namespace,
        sort: 'namespace',
        cell: (collection) => (
          <TextCell
            text={collection.collection_version?.namespace}
            to={getPageUrl(HubRoute.NamespaceDetails, {
              params: {
                id: collection.collection_version?.namespace,
              },
            })}
          />
        ),
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
        header: t('Roles'),
        type: 'count',
        value: (collection) =>
          collection.collection_version?.contents?.filter((c) => c.content_type === 'role').length,
      },
      {
        header: t('Plugins'),
        type: 'count',
        value: (collection) =>
          collection.collection_version?.contents?.filter(
            (c) => c.content_type !== 'module' && c.content_type !== 'role'
          ).length,
      },
      {
        header: t('Dependencies'),
        type: 'count',
        value: (collection) =>
          Object.keys(collection.collection_version?.dependencies || {}).length,
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
          if (display_signatures) {
            switch (collection.is_signed) {
              case true:
                return (
                  <Label
                    data-cy="label-signed"
                    icon={<CheckCircleIcon />}
                    variant="outline"
                    color="green"
                  >
                    {t('Signed')}
                  </Label>
                );
              case false:
                return (
                  <Label
                    data-cy="label-unsigned"
                    icon={<ExclamationTriangleIcon />}
                    variant="outline"
                    color="orange"
                  >
                    {t('Unsigned')}
                  </Label>
                );
            }
          } else {
            return <></>;
          }
        },
        list: 'secondary',
        value: (collection) => !collection.is_signed || collection.is_signed,
        card: display_signatures ? undefined : ColumnCardOption.hidden,
        table: display_signatures ? undefined : ColumnTableOption.hidden,
      },
    ],
    [getPageUrl, t, display_signatures]
  );
}
