import { useTranslation } from 'react-i18next';
import { useGet } from '../../common/crud/useGet';
import { HubItemsResponse } from '../useHubView';
import { hubAPI } from '../api/formatPath';
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
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ImportLog } from './components/ImportLog';
import { CollectionImport, CollectionVersionSearch } from '../collections/Collection';
import { HubRoute } from '../HubRoutes';
import { ImportList } from './components/ImportList';

export function MyImports() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const [searchParams, setSearchParams] = useSearchParams();

  const namespaceQP = searchParams.get('namespace') ?? '';
  const nameQP = searchParams.get('name') ?? undefined;
  const statusQP = searchParams.get('status') ?? undefined;

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [selectedImport, setSelectedImport] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<IFilterState>({
    name: nameQP ? [nameQP] : undefined,
    status: statusQP ? [statusQP] : undefined,
  });

  useEffect(() => {
    setSearchParams((params) => {
      collectionFilter.name !== nameQP &&
        params.set('name', collectionFilter.name?.join(',') ?? '');

      collectionFilter.status !== statusQP &&
        params.set('status', collectionFilter.status?.[0] ?? '');

      return params;
    });
  }, [collectionFilter]);

  const { data: collectionImportsResp } = useGet<HubItemsResponse<CollectionImport>>(
    namespaceQP
      ? hubAPI`/_ui/v1/imports/collections/?namespace=${namespaceQP}&keywords=${
          collectionFilter?.name?.join(',') ?? ''
        }&state=${collectionFilter?.status?.[0] ?? ''}`
      : undefined
  );

  const collectionImports =
    collectionImportsResp?.data && collectionImportsResp?.data?.length > 0
      ? collectionImportsResp?.data
      : [];

  const collectionImport =
    collectionImports.length > 0
      ? collectionImports.find((_import: CollectionImport) => _import.name === selectedImport)
      : undefined;

  const { data: collectionImportResp } = useGet<CollectionImport>(
    collectionImport?.id
      ? hubAPI`/_ui/v1/imports/collections/${collectionImport?.id ?? ''}/`
      : undefined
  );

  const collectionResp = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?namespace=${namespaceQP}&
    name=${collectionImport?.name ?? ''}&version=${collectionImport?.version ?? ''}`
  );

  const collection =
    collectionResp?.data?.data && collectionResp?.data?.data?.length > 0
      ? collectionResp.data?.data[0]
      : undefined;

  const isMultipleCollections = collectionResp?.data?.data?.length !== 1;

  function setNamespaceQP(namespace: string) {
    setSearchParams((params) => {
      params.set('namespace', namespace);
      return params;
    });
  }

  const panelContent = (
    <DrawerPanelContent widths={{ default: 'width_66', xl: 'width_66' }} hasNoBorder>
      <DrawerHead style={{ padding: '0px' }}>
        {collection && (
          <>
            {isMultipleCollections ? (
              <Title headingLevel="h3" size="lg" style={{ padding: '0px' }}>
                {collectionImport?.name}
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
                  {collectionImport?.name}
                </Title>
              </Link>
            )}
          </>
        )}
      </DrawerHead>
      <DrawerPanelBody>
        <Flex spaceItems={{ default: 'spaceItemsLg' }} direction={{ default: 'column' }}>
          <FlexItem>
            <ImportLog collectionImport={collectionImportResp} collection={collection} />
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
                  }}
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
