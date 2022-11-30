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
import { IconWrapper } from '../components/IconWrapper'
import { IPageAction } from '../PageActions/PageAction'
import { PageActions } from '../PageActions/PageActions'
import {
  ITableColumn,
  ITableColumnTypeCount,
  ITableColumnTypeLabels,
  PageTableProps,
  TableColumnCell,
} from './PageTable'

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
    defaultSubtitle: defaultCardSubtitle,
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
    <DataList aria-label="TODO" style={{ marginTop: -1, maxWidth: '100%', overflow: 'hidden' }}>
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
  rowActions?: IPageAction<T>[],
  defaultCardSubtitle?: ReactNode,
  showSelect?: boolean
): (item: T) => ReactNode {
  const data = useMemo(() => {
    let nameColumn: ITableColumn<T> | undefined
    let subtitleColumn: ITableColumn<T> | undefined
    let descriptionColumn: ITableColumn<T> | undefined
    const countColumns: ITableColumnTypeCount<T>[] = []
    let labelColumn: ITableColumnTypeLabels<T> | undefined
    const primaryColumns: ITableColumn<T>[] = []
    const secondaryColumns: ITableColumn<T>[] = []

    for (const column of tableColumns) {
      switch (column.type) {
        case 'description':
          if (!descriptionColumn) descriptionColumn = column
          break
        case 'labels':
          if (!labelColumn) labelColumn = column
          break
        case 'count':
          countColumns.push(column)
          break
        default:
          switch (column.list) {
            case 'name':
              nameColumn = column
              break
            case 'subtitle':
              subtitleColumn = column
              break
            case 'description':
              descriptionColumn = column
              break
            case 'hidden':
              break
            case 'secondary':
              secondaryColumns.push(column)
              break
            default:
              primaryColumns.push(column)
              break
          }
          break
      }
    }
    return {
      nameColumn,
      subtitleColumn,
      descriptionColumn,
      countColumns,
      primaryColumns,
      secondaryColumns,
      labelColumn,
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

  const {
    nameColumn,
    subtitleColumn,
    descriptionColumn,
    countColumns,
    primaryColumns,
    secondaryColumns,
    labelColumn,
  } = data

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
                <DataListCell key="primary" width={5}>
                  <Flex>
                    <Stack hasGutter>
                      <Flex alignItems={{ default: 'alignItemsCenter' }}>
                        {nameColumn?.icon && (
                          <IconWrapper size="xl">{nameColumn?.icon(item)}</IconWrapper>
                        )}
                        <Stack>
                          <Title headingLevel="h2" style={{ marginTop: -4, fontWeight: 'bold' }}>
                            <span id={`data-list-${key}`}>
                              <TableColumnCell column={nameColumn} item={item} />
                            </span>
                          </Title>
                          {subtitleColumn ? (
                            <Text component="small" style={{ opacity: 0.7 }}>
                              <TableColumnCell column={subtitleColumn} item={item} />
                            </Text>
                          ) : (
                            defaultCardSubtitle && (
                              <Text component="small" style={{ opacity: 0.7 }}>
                                {defaultCardSubtitle}
                              </Text>
                            )
                          )}
                        </Stack>
                      </Flex>
                      {(descriptionColumn ||
                        primaryColumns.length > 0 ||
                        countColumns.length > 0 ||
                        labelColumn) && (
                        <DescriptionList isCompact>
                          {descriptionColumn &&
                            (!descriptionColumn.value || descriptionColumn.value(item)) && (
                              <DescriptionListGroup key={descriptionColumn.header}>
                                <DescriptionListDescription>
                                  <TableColumnCell column={descriptionColumn} item={item} />
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            )}
                          {primaryColumns.map((column) => {
                            if (column.value && !column.value(item)) return <></>
                            return (
                              <DescriptionListGroup key={column.header}>
                                <DescriptionListTerm>
                                  <Text
                                    component="small"
                                    style={{ opacity: 0.7, whiteSpace: 'nowrap' }}
                                  >
                                    {column.header}
                                  </Text>
                                </DescriptionListTerm>
                                <DescriptionListDescription>
                                  <TableColumnCell column={column} item={item} />
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            )
                          })}
                          {countColumns.length > 0 && (
                            <DescriptionListGroup key="counts">
                              <DescriptionListDescription>
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: 16,
                                    marginTop: 8,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  {countColumns.map((column, i) => (
                                    <div
                                      key={i}
                                      style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}
                                    >
                                      <TableColumnCell column={column} item={item} />
                                      <small style={{ opacity: 0.7 }}>{column.header}</small>
                                    </div>
                                  ))}
                                </div>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          )}
                          {labelColumn && (
                            <DescriptionListGroup key={labelColumn.header}>
                              <DescriptionListDescription>
                                <TableColumnCell column={labelColumn} item={item} />
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          )}
                        </DescriptionList>
                      )}
                    </Stack>
                  </Flex>
                </DataListCell>,
                secondaryColumns.length > 0 ? (
                  <DataListCell key="secondary">
                    <DescriptionList isCompact>
                      {secondaryColumns.map((column) => {
                        if (column.value && !column.value(item)) return <></>
                        return (
                          <DescriptionListGroup key={column.header}>
                            <DescriptionListTerm>
                              <Text
                                component="small"
                                style={{ opacity: 0.7, whiteSpace: 'nowrap' }}
                              >
                                {column.header}
                              </Text>
                            </DescriptionListTerm>
                            <DescriptionListDescription>
                              <TableColumnCell column={column} item={item} />
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        )
                      })}
                    </DescriptionList>
                  </DataListCell>
                ) : null,
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
                <PageActions
                  actions={rowActions}
                  position={DropdownPosition.right}
                  selectedItem={item}
                  iconOnly
                />
              </DataListAction>
            )}
          </DataListItemRow>
        </DataListItem>
      )
    },
    [
      keyFn,
      isSelected,
      showSelect,
      nameColumn,
      subtitleColumn,
      defaultCardSubtitle,
      primaryColumns,
      descriptionColumn,
      countColumns,
      labelColumn,
      secondaryColumns,
      rowActions,
      onSelectClick,
    ]
  )
}
