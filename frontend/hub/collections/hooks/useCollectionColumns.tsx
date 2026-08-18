import {
  ColumnCardOption,
  ColumnListOption,
  ColumnTableOption,
  ITableColumn,
  LabelValue,
  PFColorE,
  TextCell,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { BanIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getCollectionBadge } from '../../common/collectionBadgeUtils';
import { CollectionLogo } from '../../common/Logo';
import { namespaceTitle } from '../../common/namespaceTitle';
import { useHubContext } from '../../common/useHubContext';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';

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
                <TextCell text={t('Deprecated')} color={PFColorE.Danger} icon={<BanIcon />} />
              )}
            </>
          );
        },
        card: 'name',
        list: 'name',
        sort: 'name',
        icon: (collection) => <CollectionLogo collection={collection} />,
      },
      {
        header: t('Provided by'),
        type: 'text',
        value: (collection) =>
          t(`Provided by {{namespace}}`, {
            namespace: namespaceTitle({
              name: collection.collection_version?.namespace || '',
              company: collection.namespace_metadata?.company,
            }),
          }),
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
        card: ColumnCardOption.hidden,
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
                  <TextCell
                    text={t('Signed')}
                    color={PFColorE.Success}
                    icon={<CheckCircleIcon />}
                  />
                );
              case false:
                return (
                  <TextCell
                    text={t('Unsigned')}
                    color={PFColorE.Warning}
                    icon={<ExclamationTriangleIcon />}
                  />
                );
            }
          } else {
            return <></>;
          }
        },
        list: 'secondary',
        value: (collection) => !collection.is_signed || collection.is_signed,
        card: ColumnCardOption.hidden,
        table: display_signatures ? undefined : ColumnTableOption.hidden,
      },
      {
        header: t('Badges'),
        type: 'labels',
        value: (collection) => {
          const labels: LabelValue[] = [];
          if (collection.repository?.name) {
            labels.push(getCollectionBadge(collection.repository.name, t));
          }
          if (display_signatures) {
            labels.push(
              collection.is_signed
                ? { label: t('Signed'), status: 'success' as const, variant: 'outline' as const }
                : { label: t('Unsigned'), status: 'warning' as const, variant: 'outline' as const }
            );
          }
          return labels;
        },
        table: ColumnTableOption.hidden,
        list: ColumnListOption.hidden,
      },
    ],
    [getPageUrl, t, display_signatures, name, namespace, repository]
  );
}
