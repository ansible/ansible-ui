import {
  DataList,
  DataListAction,
  DataListCell,
  DataListCheck,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DropdownPosition,
  Flex,
  Stack,
  Text,
  Title,
} from '@patternfly/react-core'
import { ReactNode, useCallback, useMemo } from 'react'
import { ITableColumn, PageTableProps } from './PageTable'
import { ITypedAction, TypedActions } from './TypedActions'

export type PageTableListProps<T extends object> = PageTableProps<T>

export function PageTableList<T extends object>(props: PageTableListProps<T>) {
  const {
    keyFn,
    pageItems,
    tableColumns,
    isSelected,
    selectItem,
    unselectItem,
    rowActions,
    defaultCardSubtitle,
    showSelect,
  } = props

  const columnsToDataList = useColumnsToDataList(
    tableColumns,
    keyFn,
    isSelected,
    selectItem,
    unselectItem,
    rowActions,
    defaultCardSubtitle,
    showSelect
  )

  return (
    <DataList aria-label="TODO" style={{ marginTop: -1 }}>
      {pageItems?.map(columnsToDataList)}
    </DataList>
  )
}

export function useColumnsToDataList<T extends object>(
  tableColumns: ITableColumn<T>[],
  keyFn: (item: T) => string | number,
  isSelected?: (item: T) => boolean,
  selectItem?: (item: T) => void,
  unselectItem?: (item: T) => void,
  rowActions?: ITypedAction<T>[],
  defaultCardSubtitle?: ReactNode,
  showSelect?: boolean
): (item: T) => ReactNode {
  const data = useMemo(() => {
    let cols = tableColumns.filter((column) => column.card !== 'hidden')
    const nameColumn = cols.shift()
    const descriptionColumn = cols.find((column) => column.card === 'description')
    if (descriptionColumn) {
      cols = cols.filter((column) => column !== descriptionColumn)
    }
    return {
      nameColumn: nameColumn,
      descriptionColumn: descriptionColumn,
      columns: cols.filter((column) => column.list !== 'secondary'),
      secondary: cols.filter((column) => column.list === 'secondary'),
    }
  }, [tableColumns])

  const onSelectClick = useCallback(
    (item: T) => {
      if (isSelected?.(item)) {
        unselectItem?.(item)
      } else {
        selectItem?.(item)
      }
    },
    [isSelected, selectItem, unselectItem]
  )

  return useCallback(
    (item: T) => {
      const key = keyFn(item)
      const isItemSelected = isSelected?.(item)
      return (
        <DataListItem key={key} aria-labelledby={`data-list-${key}`} isExpanded={isItemSelected}>
          <DataListItemRow>
            {showSelect && (
              <DataListCheck
                aria-labelledby={`data-list-check-${key}`}
                name={`data-list-check-${key}`}
                isChecked={isSelected?.(item)}
                onClick={() => onSelectClick(item)}
              />
            )}
            <DataListItemCells
              dataListCells={[
                <DataListCell key="primary">
                  <Flex>
                    <Stack hasGutter>
                      <Stack>
                        <Title headingLevel="h2">
                          <span id={`data-list-${key}`}>{data.nameColumn?.cell(item)}</span>
                        </Title>
                        {data.descriptionColumn ? (
                          <Text component="small" style={{ opacity: 0.7 }}>
                            {data.descriptionColumn.cell(item)}
                          </Text>
                        ) : (
                          defaultCardSubtitle && (
                            <Text component="small" style={{ opacity: 0.7 }}>
                              {defaultCardSubtitle}
                            </Text>
                          )
                        )}
                      </Stack>
                      <DescriptionList>
                        {data.columns.map((column) => {
                          const value = column.cell(item)
                          if (!value) return <></>
                          return (
                            <DescriptionListGroup key={column.header}>
                              <DescriptionListTerm>
                                <Text component="small" style={{ opacity: 0.7 }}>
                                  {column.header}
                                </Text>
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {column.cell(item)}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          )
                        })}
                      </DescriptionList>
                    </Stack>
                  </Flex>
                </DataListCell>,
                <DataListCell key="secondary">
                  <Flex>
                    <DescriptionList>
                      {data.secondary.map((column) => {
                        const value = column.cell(item)
                        if (!value) return <></>
                        return (
                          <DescriptionListGroup key={column.header}>
                            <DescriptionListTerm>
                              <Text component="small" style={{ opacity: 0.7 }}>
                                {column.header}
                              </Text>
                            </DescriptionListTerm>
                            <DescriptionListDescription>
                              {column.cell(item)}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        )
                      })}
                    </DescriptionList>
                  </Flex>
                </DataListCell>,
              ]}
            />
            {rowActions && (
              <DataListAction
                aria-labelledby="check-action-item1 check-action-action1"
                id="check-action-action1"
                aria-label="Actions"
                isPlainButtonAction
                style={{ whiteSpace: 'nowrap' }}
              >
                <TypedActions
                  actions={rowActions}
                  position={DropdownPosition.right}
                  selectedItem={item}
                />
              </DataListAction>
            )}
          </DataListItemRow>
        </DataListItem>
      )
    },
    [
      data.columns,
      data.descriptionColumn,
      data.nameColumn,
      data.secondary,
      defaultCardSubtitle,
      isSelected,
      keyFn,
      onSelectClick,
      rowActions,
      showSelect,
    ]
  )
}
