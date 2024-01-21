import { useTranslation, Trans } from 'react-i18next';
import { HubItemsResponse } from '../../common/useHubView';
import { hubAPI } from '../../common/api/formatPath';
import { DateTimeCell, PageToolbar, IFilterState } from '../../../../framework';
import {
  Button,
  Flex,
  FlexItem,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListItemCells,
  Title,
} from '@patternfly/react-core';
import React, { useCallback, Dispatch, SetStateAction, useEffect } from 'react';
import { HubNamespace } from '../../namespaces/HubNamespace';
import { CollectionImport } from '../../collections/Collection';
import { ImportStatusIndicator } from '../components/ImportStatusIndicator';
import { PageAsyncSingleSelect } from '../../../../framework/PageInputs/PageAsyncSingleSelect';
import { requestGet, getItemKey } from '../../../common/crud/Data';
import { useSelectNamespaceSingle } from '../hooks/useNamespaceSelector';
import { singleSelectBrowseAdapter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import styled from 'styled-components';
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';
import { EmptyStateFilter } from '../../../../framework/components/EmptyStateFilter';
import { EmptyStateError } from '../../../../framework/components/EmptyStateError';
import { useCollectionImportFilters } from '../hooks/useCollectionImportFilters';
import './hub-import-collections-filters.css';
import { PagePagination } from '../../../../framework/PageTable/PagePagination';
import { LoadingState } from '../../../../framework/components/LoadingState';

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
  setSelectedNamespace: (namespace: string) => void;
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
    (item: HubNamespace) => item.name,
    (name) => ({ name })
  );

  useEffect(() => {
    collectionImports.length && setSelectedImport(collectionImports[0].id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionImports]);

  const queryOptions = useCallback(async () => {
    const response = await requestGet<HubItemsResponse<HubNamespace>>(
      hubAPI`/_ui/v1/my-namespaces/?limit=200`
    );

    return Promise.resolve({
      total: response?.meta?.count || 0,
      options:
        response?.data.map((ns: HubNamespace) => ({
          value: ns.name,
          label: ns.name,
        })) || [],
    });
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
            queryOptions={queryOptions}
            onSelect={(namespace: string) => setSelectedNamespace(namespace)}
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
                          <DataListItem id={collectionImport.id} key={collectionImport.id}>
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
                                        <DateTimeCell
                                          format="since"
                                          value={collectionImport.finished_at}
                                        />
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
