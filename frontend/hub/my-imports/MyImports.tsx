import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGet } from '../../common/crud/useGet';
import { HubItemsResponse } from '../common/useHubView';
import { hubAPI } from '../common/api/formatPath';
import { HubRoute } from '../main/HubRoutes';
import {
  Scrollable,
  PageLayout,
  PageHeader,
  useGetPageUrl,
  IFilterState,
} from '../../../framework';
import {
  PageSection,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Flex,
  FlexItem,
  DrawerPanelContent,
  DrawerHead,
  DrawerPanelBody,
  Title,
} from '@patternfly/react-core';
import { CollectionImport, CollectionVersionSearch } from '../collections/Collection';
import { ImportLog } from './components/ImportLog';
import { ImportList } from './components/ImportList';

export function MyImports() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const [searchParams, setSearchParams] = useSearchParams();

  const namespaceQP = searchParams.get('namespace') ?? '';
  const nameQP = searchParams.get('name') ?? undefined;
  const statusQP = searchParams.get('status') ?? undefined;
  const versionQP = searchParams.get('version') ?? undefined;
  const pageQP = Number(searchParams.get('page')) || 1;
  const perPageQP = Number(searchParams.get('perPage')) || 10;

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [selectedImport, setSelectedImport] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<IFilterState>({
    name: nameQP ? [nameQP] : undefined,
    status: statusQP ? [statusQP] : undefined,
    version: versionQP ? [versionQP] : undefined,
  });
  const [page, setPage] = useState(pageQP);
  const [perPage, setPerPage] = useState(perPageQP);

  useEffect(() => {
    setSearchParams((params) => {
      collectionFilter.name !== nameQP &&
        params.set('name', collectionFilter.name?.join(',') ?? '');

      collectionFilter.status !== statusQP &&
        params.set('status', collectionFilter.status?.[0] ?? '');

      collectionFilter.version !== versionQP &&
        params.set('version', collectionFilter.version?.join(',') ?? '');

      page !== pageQP && params.set('page', page.toString());

      perPage !== perPageQP && params.set('perPage', perPage.toString());

      return params;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionFilter, page, perPage]);

  const {
    data: collectionImportsResp,
    isLoading: collectionImportsLoading,
    error: collectionImportsError,
  } = useGet<HubItemsResponse<CollectionImport>>(
    namespaceQP ? hubAPI`/_ui/v1/imports/collections/` : '',
    namespaceQP
      ? {
          sort: '-created',
          namespace: namespaceQP,
          keywords: collectionFilter?.name?.join(',') ?? '',
          state: collectionFilter?.status?.[0] ?? '',
          version: collectionFilter?.version?.join(',') ?? '',
          offset: (perPage * (page - 1)).toString(),
          limit: perPage.toString(),
        }
      : undefined
  );

  const collectionImports =
    collectionImportsResp?.data && collectionImportsResp?.data?.length > 0
      ? collectionImportsResp?.data
      : [];

  const collectionImportsCount = collectionImportsResp?.meta.count;

  const collectionImport =
    collectionImports.length > 0
      ? collectionImports.find((_import: CollectionImport) => _import.id === selectedImport)
      : undefined;

  const {
    data: collectionImportResp,
    isLoading: collectionImportLoading,
    error: collectionImportError,
  } = useGet<CollectionImport>(
    collectionImport?.id ? hubAPI`/_ui/v1/imports/collections/${collectionImport?.id ?? ''}/` : '',
    undefined,
    { refreshInterval: 10000 }
  );

  const {
    data: collectionResp,
    isLoading: colletionIsLoading,
    error: collectionError,
  } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    {
      namespace: namespaceQP,
      name: collectionImport?.name ?? '',
      version: collectionImport?.version ?? '',
    },
    { refreshInterval: 10000 }
  );

  const collection =
    collectionResp?.data && collectionResp?.data?.length > 0 ? collectionResp.data[0] : undefined;

  const isMultipleCollections = collectionResp?.data?.length !== 1;

  function setNamespaceQP(namespace: string) {
    setSearchParams((params) => {
      params.set('namespace', namespace);
      return params;
    });
  }

  const importLogLoading = colletionIsLoading || collectionImportLoading;
  const importLogError = collectionImportError || collectionError;

  const panelContent = (
    <DrawerPanelContent
      widths={{ default: 'width_66', xl: 'width_66' }}
      hasNoBorder
      data-cy="import-log-content"
    >
      <DrawerHead style={{ padding: '0px' }}>
        {collectionImport && (
          <>
            {isMultipleCollections || !collection ? (
              <Title headingLevel="h3" size="lg" style={{ padding: '0px' }}>
                {collectionImport?.namespace}.{collectionImport?.name}
              </Title>
            ) : (
              <Link
                to={getPageUrl(HubRoute.CollectionDetails, {
                  params: {
                    repository: collection.repository?.name,
                    namespace: collection.collection_version?.namespace,
                    name: collection.collection_version?.name,
                    version: collection.collection_version?.version,
                  },
                })}
                style={{ color: 'var(--pf-v5-global--text--Color)' }}
              >
                <Title headingLevel="h3" size="lg">
                  {collectionImport?.namespace}.{collectionImport?.name}
                </Title>
              </Link>
            )}
          </>
        )}
      </DrawerHead>
      <DrawerPanelBody>
        <Flex spaceItems={{ default: 'spaceItemsLg' }} direction={{ default: 'column' }}>
          <FlexItem>
            <ImportLog
              isLoading={importLogLoading}
              error={importLogError}
              collectionImport={collectionImportResp}
              collection={collection}
            />
          </FlexItem>
        </Flex>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <PageLayout>
      <PageHeader title={t('My imports')} description={t('Imported collections')} />
      <Scrollable>
        <PageSection variant="light">
          <Drawer isExpanded={isDrawerExpanded} isStatic>
            <DrawerContent panelContent={panelContent}>
              <DrawerContentBody>
                <ImportList
                  isLoading={collectionImportsLoading}
                  error={collectionImportsError}
                  collectionImports={collectionImports}
                  selectedImport={selectedImport}
                  setSelectedImport={(collectionImport) => {
                    setSelectedImport(collectionImport);
                  }}
                  setSelectedNamespace={(namespace) => {
                    setNamespaceQP(namespace);
                  }}
                  queryParams={{
                    status: statusQP,
                    name: nameQP,
                    namespace: namespaceQP,
                    perPage: perPageQP,
                    page: pageQP,
                  }}
                  setPage={setPage}
                  setPerPage={setPerPage}
                  itemCount={collectionImportsCount}
                  setDrawerExpanded={() => {
                    setIsDrawerExpanded(true);
                  }}
                  collectionFilter={collectionFilter}
                  setCollectionFilter={(options) => {
                    setCollectionFilter(options);
                  }}
                />
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </PageSection>
      </Scrollable>
    </PageLayout>
  );
}
