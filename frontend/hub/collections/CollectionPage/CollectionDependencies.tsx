import { Button, PageSection, Title } from '@patternfly/react-core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import {
  ITableColumn,
  IToolbarFilter,
  PFColorE,
  PageTable,
  Scrollable,
  TextCell,
  ToolbarFilterType,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { requestGet } from '../../../common/crud/Data';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse, useHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';

export function CollectionDependencies() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const { t } = useTranslation();

  const [missingCollection, setMissingCollection] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const navigate = usePageNavigate();

  if (!collection?.collection_version?.dependencies)
    return <HubError error={{ name: '', message: t`Error loading dependencies` }}></HubError>;

  const dependencies = collection?.collection_version?.dependencies;

  function goToDependency(dependency: string) {
    setIsLoading(dependency);

    void (async () => {
      try {
        setMissingCollection('');
        const strings = dependency.split('.');

        const namespace = strings[0];
        const name = strings[1];

        const result = await requestGet<HubItemsResponse<CollectionVersionSearch>>(
          hubAPI`/v3/plugin/ansible/search/collection-versions/?namespace=${namespace}&name=${name}`
        );

        // select the first repo
        const repository = result.data[0].repository?.name;
        setIsLoading('');
        navigate(HubRoute.CollectionDetails, { params: { repository, namespace, name } });
      } catch (ex) {
        setIsLoading('');
        setMissingCollection(dependency);
      }
    })();
  }

  return (
    <Scrollable>
      <PageSection variant="light">
        <Title headingLevel="h2">{t('Dependencies')}</Title>
        {t`This collections requires the following collections for use`}
        <br></br>
        <WarningMessage>
          {missingCollection && t`Collection was not found in the system`}
        </WarningMessage>
        <br></br>
        {Object.keys(collection.collection_version.dependencies).map((key) => {
          return (
            <Button
              key={key}
              isLoading={isLoading === key}
              variant="link"
              onClick={() => {
                goToDependency(key);
              }}
            >{`${key} ${dependencies?.[key]}`}</Button>
          );
        })}
        <br></br>
        <br></br>
        {t`This collection is being used by`}
        <UsedByDependenciesTable collection={collection} />
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
      emptyStateTitle={t('No dependencies')}
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
        type: ToolbarFilterType.SingleText,
        query: 'keywords',
        comparison: 'contains',
      },
    ];
    return filters;
  }, [t]);
}

const WarningMessage = styled.span`
  color: ${PFColorE.Red};
`;
