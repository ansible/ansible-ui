import {
  Button,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DateTimeCell, IFilterState, PageToolbar } from '../../../../framework';
import { PageAsyncSingleSelect } from '../../../../framework/PageInputs/PageAsyncSingleSelect';
import { PagePagination } from '../../../../framework/PageTable/PagePagination';
import { singleSelectBrowseAdapter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import { EmptyStateError } from '../../../../framework/components/EmptyStateError';
import { EmptyStateFilter } from '../../../../framework/components/EmptyStateFilter';
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';
import { LoadingState } from '../../../../framework/components/LoadingState';
import { getItemKey, requestGet } from '../../../common/crud/Data';
import { CollectionImport } from '../../collections/Collection';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { HubNamespace } from '../../namespaces/HubNamespace';
import { ImportStatusIndicator } from '../components/ImportStatusIndicator';
import { useCollectionImportFilters } from '../hooks/useCollectionImportFilters';
import { useSelectNamespaceSingle } from '../hooks/useNamespaceSelector';
import './hub-import-collections-filters.css';

const NamespaceSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const NamespaceSelectorLabel = styled.div`
  width: 100px;
  text-align: left;
`;

const NamespaceSelector = styled.div`
  flex-grow: 1;
`;

const EmptyStateWrapper = styled.div`
  height: 500px;
`;

const EmptyStateErrorWrapper = styled.div`
  height: auto;
`;

interface IProps {
  collectionImports: CollectionImport[];
  selectedImport: string;
  setSelectedImport: (collectionImport: string) => void;
  setSelectedNamespace: (namespace: string | null) => void;
  setDrawerExpanded: () => void;
  collectionFilter: IFilterState;
  setCollectionFilter: Dispatch<SetStateAction<IFilterState>>;
  queryParams: {
    status?: string;
    name?: string;
    namespace?: string;
    page: number;
    perPage: number;
  };
  setPerPage: (perPage: number) => void;
  setPage: (page: number) => void;
  itemCount?: number;
  isLoading: boolean;
  error?: Error;
}

export function ImportList({
  collectionImports,
  setSelectedNamespace,
  selectedImport,
  setSelectedImport,
  setDrawerExpanded,
  collectionFilter,
  setCollectionFilter,
  queryParams,
  setPerPage,
  setPage,
  isLoading,
  error,
  itemCount,
}: IProps) {
  const { t } = useTranslation();

  const singleSelector = useSelectNamespaceSingle();
  const singleSelectorBrowser = singleSelectBrowseAdapter<HubNamespace>(
    singleSelector.openBrowse,
    (item: HubNamespace) => item?.name || '',
    (name) => ({ name })
  );

  useEffect(() => {
    collectionImports.length && setSelectedImport(collectionImports[0].id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionImports]);

  const queryOptions = useCallback(async () => {
    // polling namespaces to display in selector
    const namespaces = [];
    const perPage = 100;
    let page = 0;
    let count = 0;
    while (page * perPage <= count) {
      page++;
      const response = await requestGet<HubItemsResponse<HubNamespace>>(
        hubAPI`/_ui/v1/my-namespaces/?limit=${perPage.toString()}&offset=${(
          perPage *
          (page - 1)
        ).toString()}`
      );

      const resp = response?.data.map((ns: HubNamespace) => ({
        value: ns.name,
        label: ns.name,
      }));

      count = response?.meta.count || 0;

      if (resp) namespaces.push(...resp);

      const isInNamespace = resp.some((ns) => ns.value === namespace);

      if (isInNamespace) break;
    }

    return Promise.resolve({
      remaining: 0,
      options: namespaces,
      next: 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectDataListItem = (
    _event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
    id: string
  ) => {
    setSelectedImport(id);
    setDrawerExpanded();
  };

  const toolbarFilters = useCollectionImportFilters();

  const { name, status, namespace, page, perPage } = queryParams;

  const noFilters = !name && !status;

  return (
    <>
      <NamespaceSelectorWrapper>
        <NamespaceSelectorLabel>
          <Trans>Namespace</Trans>
        </NamespaceSelectorLabel>
        <NamespaceSelector>
          <PageAsyncSingleSelect<string>
            id="namespace-selector"
            queryOptions={queryOptions}
            onSelect={(namespace: string | null) => setSelectedNamespace(namespace)}
            placeholder={t('Select namespace')}
            value={namespace || ''}
            footer={
              <Button
                variant="link"
                onClick={() =>
                  singleSelectorBrowser?.(
                    (selection) => setSelectedNamespace(selection),
                    namespace || ''
                  )
                }
              >
                {t`Browse`}
              </Button>
            }
            queryLabel={(value) => value}
          />
        </NamespaceSelector>
      </NamespaceSelectorWrapper>

      <div className="hub-import-collections-filters">
        <PageToolbar
          keyFn={getItemKey}
          itemCount={collectionImports.length}
          toolbarFilters={toolbarFilters}
          setFilterState={setCollectionFilter}
          filterState={collectionFilter}
          disableCardView
          disableListView
          disableTableView
          disablePagination
        />
      </div>
      {error ? (
        <EmptyStateErrorWrapper>
          <EmptyStateError titleProp={error.name} message={error.message} />
        </EmptyStateErrorWrapper>
      ) : (
        <>
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              {!namespace ? (
                <EmptyStateWrapper>
                  <EmptyStateNoData title={t('No namespace selected.')} description="" />
                </EmptyStateWrapper>
              ) : (
                <>
                  {!collectionImports?.length ? (
                    <EmptyStateWrapper>
                      {!noFilters ? (
                        <EmptyStateFilter
                          clearAllFilters={() =>
                            setCollectionFilter({ name: undefined, status: undefined })
                          }
                        />
                      ) : (
                        <EmptyStateNoData
                          title={t('No imports.')}
                          description={t('There have not been any imports on this namespace.')}
                        />
                      )}
                    </EmptyStateWrapper>
                  ) : (
                    <>
                      <DataList
                        aria-label={t('Collection import list')}
                        selectedDataListItemId={selectedImport}
                        onSelectDataListItem={onSelectDataListItem}
                      >
                        {collectionImports.map((collectionImport) => (
                          <DataListItem
                            id={collectionImport.id}
                            key={collectionImport.id}
                            data-cy={`row-id-${collectionImport.name}`}
                          >
                            <DataListItemRow>
                              <DataListItemCells
                                dataListCells={[
                                  <DataListCell key="primary-content">
                                    <Flex
                                      spaceItems={{ default: 'spaceItemsMd' }}
                                      direction={{ default: 'column' }}
                                    >
                                      <FlexItem>
                                        <Title headingLevel="h4">
                                          {collectionImport.name} v{collectionImport.version}
                                        </Title>
                                      </FlexItem>
                                      <FlexItem>
                                        <ImportStatusIndicator
                                          type="secondary"
                                          status={collectionImport.state}
                                        />
                                      </FlexItem>
                                      <FlexItem>
                                        {collectionImport.state}{' '}
                                        <DateTimeCell value={collectionImport.finished_at} />
                                      </FlexItem>
                                    </Flex>
                                  </DataListCell>,
                                ]}
                              />
                            </DataListItemRow>
                          </DataListItem>
                        ))}
                      </DataList>
                      <PagePagination
                        itemCount={itemCount}
                        page={page}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        setPage={setPage}
                      />
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
