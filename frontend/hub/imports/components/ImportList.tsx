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
import React, { useCallback, Dispatch, SetStateAction } from 'react';
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
import { useCollectionImportFilters } from '../hooks/useCollectionImportFilters';
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

interface IProps {
  collectionImports: CollectionImport[];
  queryParams: {
    status?: string;
    name?: string;
    namespace?: string;
  };
  selectedImport: string;
  setSelectedImport: (collectionImport: string) => void;
  setSelectedNamespace: (namespace: string) => void;
  setDrawerExpanded: () => void;
  collectionFilter: IFilterState;
  setCollectionFilter: Dispatch<SetStateAction<IFilterState>>;
}

export function ImportList({
  collectionImports,
  queryParams,
  setSelectedNamespace,
  selectedImport,
  setSelectedImport,
  setDrawerExpanded,
  collectionFilter,
  setCollectionFilter,
}: IProps) {
  const { t } = useTranslation();

  const singleSelector = useSelectNamespaceSingle();
  const singleSelectorBrowser = singleSelectBrowseAdapter<HubNamespace>(
    singleSelector.openBrowse,
    (item: HubNamespace) => item.name,
    (name) => ({ name })
  );

  const queryOptions = useCallback(async () => {
    const response = await requestGet<HubItemsResponse<HubNamespace>>(
      hubAPI`/_ui/v1/my-namespaces/?page_size=50`
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
    name: string
  ) => {
    setSelectedImport(name);
    setDrawerExpanded();
  };

  const toolbarFilters = useCollectionImportFilters();

  const { name, status, namespace } = queryParams;

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
            <DataList
              aria-label={t('Collection import list')}
              selectedDataListItemId={selectedImport}
              onSelectDataListItem={onSelectDataListItem}
            >
              {collectionImports.map((collectionImport) => (
                <DataListItem id={collectionImport.name} key={collectionImport.id}>
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
                              <DateTimeCell format="since" value={collectionImport.finished_at} />
                            </FlexItem>
                          </Flex>
                        </DataListCell>,
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
              ))}
            </DataList>
          )}
        </>
      )}
    </>
  );
}
