import { useTranslation } from 'react-i18next';
import { Scrollable } from '../../../../framework';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  PageSection,
  Stack,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';
import { HubError } from '../../common/HubError';
import { useHubView } from '../../useHubView';
import { PageTable } from '../../../../framework';
import { useGetPageUrl } from '../../../../framework';
import { ITableColumn } from '../../../../framework';
import { useMemo } from 'react';
import { HubRoute } from '../../HubRoutes';
import { TextCell } from '../../../../framework';
import { hubAPI } from '../../api/formatPath';
import { IToolbarFilter } from '../../../../framework';
import { ToolbarFilterType } from '../../../../framework';

export function CollectionDependencies() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const { t } = useTranslation();

  if (!collection?.collection_version?.dependencies)
    return <HubError error={{ name: '', message: t`Error loading dependencies` }}></HubError>;

  return (
    <Scrollable>
      <PageSection variant="light">
        <Stack hasGutter>
          <Title headingLevel="h2">{t('Dependencies')}</Title>
          {t`This collections requires the following collections for use`}
          <DescriptionList isHorizontal>
            {Object.keys(collection.collection_version.dependencies).map((key) => {
              return (
                <DescriptionListGroup key={key}>
                  <DescriptionListTerm>{key}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {collection.collection_version?.dependencies
                      ? collection.collection_version.dependencies[key]
                      : ''}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              );
            })}
          </DescriptionList>
          {t`This collection is being used by`}
          <UsedByDependenciesTable collection={collection} />
        </Stack>
      </PageSection>
    </Scrollable>
  );
}

function UsedByDependenciesTable(props: { collection: CollectionVersionSearch }) {
  const version = props.collection.collection_version;
  const { t } = useTranslation();
  const tableColumns = useCollectionColumns();
  const filters = useCollectionFilters();

  const view = useHubView<UsedByDependenciesTableType>({
    url: hubAPI`/_ui/v1/collection-versions/`,
    keyFn: (item) => item.name + '_' + item.namespace,
    queryParams: {
      dependency: `${version?.namespace}.${version?.name}`,
    },
  });

  return (
    <PageTable<UsedByDependenciesTableType>
      id="hub-used-by-dependencies-table"
      tableColumns={tableColumns}
      toolbarFilters={filters}
      errorStateTitle={t('Error loading used by dependencies')}
      emptyStateTitle={t('No collections yet')}
      compact={true}
      {...view}
    />
  );
}

type UsedByDependenciesTableType = {
  name: string;
  namespace: string;
  repository_list: string[];
  version: string;
};

function useCollectionColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return useMemo<ITableColumn<UsedByDependenciesTableType>[]>(
    () => [
      {
        header: t('Name'),
        value: (collection) => collection.namespace + '_' + collection.name,
        cell: (collection) => (
          <TextCell
            text={`${collection.namespace}.${collection.name}.v${collection.version}`}
            to={getPageUrl(HubRoute.CollectionPage, {
              params: {
                name: collection.name,
                namespace: collection.namespace,
                repository:
                  collection.repository_list.length > 0
                    ? collection.repository_list[0]
                    : 'published',
              },
            })}
          />
        ),
        sort: 'collection',
      },
    ],
    [getPageUrl, t]
  );
}

export function useCollectionFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(() => {
    const filters: IToolbarFilter[] = [
      {
        key: 'name__icontains',
        label: t('Name'),
        type: ToolbarFilterType.Text,
        query: 'keywords',
        comparison: 'contains',
      },
    ];
    return filters;
  }, [t]);
}
