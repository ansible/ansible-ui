import { useTranslation } from 'react-i18next';
import { PFColorE, Scrollable } from '../../../../framework';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  PageSection,
  Stack,
  Title,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';
import { HubError } from '../../common/HubError';
import { HubItemsResponse, useHubView } from '../../useHubView';
import { PageTable } from '../../../../framework';
import { useGetPageUrl } from '../../../../framework';
import { ITableColumn } from '../../../../framework';
import { useMemo } from 'react';
import { HubRoute } from '../../HubRoutes';
import { TextCell } from '../../../../framework';
import { hubAPI } from '../../api/formatPath';
import { IToolbarFilter } from '../../../../framework';
import { requestGet } from '../../../common/crud/Data';
import { LoadingPage } from '../../../../framework';
import { ToolbarFilterType } from '../../../../framework';
import { usePageNavigate } from '../../../../framework';

export function CollectionDependencies() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const { t } = useTranslation();

  const [missingCollection, setMissingCollection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = usePageNavigate();

  if (!collection?.collection_version?.dependencies)
    return <HubError error={{ name: '', message: t`Error loading dependencies` }}></HubError>;

  if (isLoading) {
    return <LoadingPage />;
  }

  const dependencies = collection?.collection_version?.dependencies;

  function goToDependency(dependency: string) {
    setIsLoading(true);

    (async () => {
      try {
        setMissingCollection('');
        const strings = dependency.split('.');

        const namespace = strings[0];
        const name = strings[1];

        const result = await requestGet<HubItemsResponse<CollectionVersionSearch>>(
          hubAPI`/v3/plugin/ansible/search/collection-versions?namespace=${namespace}&name=${name}`
        );

        // select the first repo
        const repository = result.data[0].repository?.name;
        setIsLoading(false);
        navigate(HubRoute.CollectionDetails, { params: { repository, namespace, name } });
      } catch (ex) {
        setIsLoading(false);
        setMissingCollection(dependency);
      }
    })();
  }

  return (
    <Scrollable>
      <PageSection variant="light">
        <Stack hasGutter>
          <Title headingLevel="h2">{t('Dependencies')}</Title>

          {t`This collections requires the following collections for use`}
          <br></br>
          <span style={{ color: PFColorE.Danger }}>
            {missingCollection && t`Collection was not found in the system`}
          </span>
          <DescriptionList isHorizontal>
            {Object.keys(collection.collection_version.dependencies).map((key) => {
              return (
                <DescriptionListGroup key={key}>
-                  <DescriptionListDescription>
                  <Button
                    variant="link"
                    onClick={() => {
                      goToDependency(key);
                    }}
                  >{`${key} ${dependencies?.[key]}`}</Button>
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
