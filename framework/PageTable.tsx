import {
    Button,
    ClipboardCopy,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    EmptyStateSecondaryActions,
    EmptyStateVariant,
    Flex,
    FlexItem,
    InputGroup,
    Label,
    LabelGroup,
    OnPerPageSelect,
    OnSetPage,
    Pagination,
    PaginationVariant,
    SelectOption,
    Skeleton,
    Split,
    SplitItem,
    TextInputGroup,
    TextInputGroupMain,
    TextInputGroupUtilities,
    Title,
    Toolbar,
    ToolbarContent,
    ToolbarFilter,
    ToolbarGroup,
    ToolbarItem,
    ToolbarToggleGroup,
    Tooltip,
    Truncate,
} from '@patternfly/react-core'
import { ArrowRightIcon, ExclamationCircleIcon, FilterIcon, PlusCircleIcon, SearchIcon, TimesIcon } from '@patternfly/react-icons'
import { ActionsColumn, IAction, SortByDirection, TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table'
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base'
import useResizeObserver from '@react-hook/resize-observer'
import { DateTime } from 'luxon'
import {
    CSSProperties,
    Dispatch,
    Fragment,
    MouseEvent,
    ReactNode,
    SetStateAction,
    UIEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { Link } from 'react-router-dom'
import { BulkSelector } from './components/BulkSelector'
import { IconWrapper } from './components/IconWrapper'
import { getPatternflyColor, PatternFlyColor } from './components/patternfly-colors'
import { SingleSelect2 } from './components/SingleSelect'
import { useBreakpoint } from './components/useBreakPoint'
import { PageBody } from './PageBody'
import { useColumnModal } from './PageColumnModal'
import { PageHeader, PageHeaderProps } from './PageHeader'
import { PageLayout } from './PageLayout'
import { useSettings } from './Settings'
import { IItemAction, isItemActionClick, ITypedAction, TypedActions, TypedActionType } from './TypedActions'

export type TablePageProps<T extends object> = PageHeaderProps & PageTableProps<T> & { error?: Error }

export function TablePage<T extends object>(props: TablePageProps<T>) {
    return (
        <>
            <PageLayout>
                <PageHeader {...props} />
                <PageBody>
                    <PageTable {...props} />
                </PageBody>
            </PageLayout>
        </>
    )
}

export type PageTableProps<T extends object> = {
    keyFn: (item: T) => string | number

    itemCount?: number
    pageItems: T[] | undefined

    toolbarActions?: ITypedAction<T>[]

    tableColumns: ITableColumn<T>[]

    rowActions?: IItemAction<T>[]

    toolbarFilters?: IToolbarFilter[]
    filters?: Record<string, string[]>
    setFilters?: Dispatch<SetStateAction<Record<string, string[]>>>
    clearAllFilters?: () => void

    sort?: string
    setSort?: (sort: string) => void
    sortDirection?: 'asc' | 'desc'
    setSortDirection?: (sortDirection: 'asc' | 'desc') => void
    compact?: boolean

    page: number
    perPage: number
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void
    autoHidePagination?: boolean

    isSelected?: (item: T) => boolean
    selectedItems?: T[]
    selectItem?: (item: T) => void
    unselectItem?: (item: T) => void
    selectItems?: (items: T[]) => void
    unselectAll?: () => void
    onSelect?: (item: T) => void
    selectNoneText?: string

    errorStateTitle: string
    error?: Error

    emptyStateTitle: string
    emptyStateDescription?: string
    emptyStateButtonText?: string
    emptyStateButtonClick?: () => void

    t?: (t: string) => string
}

export function PageTable<T extends object>(props: PageTableProps<T>) {
    const {
        tableColumns,
        pageItems,
        selectItem,
        unselectItem,
        isSelected,
        keyFn,
        rowActions,
        toolbarActions,
        itemCount,
        perPage,
        clearAllFilters,
        filters,
        error,
        onSelect,
        unselectAll,
    } = props
    let { t } = props
    t = t ? t : (t: string) => t
    const showSelect = toolbarActions?.find((toolbarAction) => TypedActionType.bulk === toolbarAction.type) !== undefined
    const containerRef = useRef<HTMLDivElement>(null)
    const [scroll, setScroll] = useState<{ left: number; right: number; top: number; bottom: number }>({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    })
    const updateScroll = useCallback((div: HTMLDivElement | null) => {
        if (!div) return
        setScroll({
            top: div.scrollTop,
            bottom: div.scrollHeight - div.clientHeight - div.scrollTop,
            left: div.scrollLeft,
            right: div.scrollWidth - div.clientWidth - div.scrollLeft,
        })
    }, [])
    const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => updateScroll(event.currentTarget), [updateScroll])
    useResizeObserver(containerRef, () => updateScroll(containerRef.current))
    useEffect(() => updateScroll(containerRef.current), [updateScroll])

    const settings = useSettings()
    const { openColumnModal, columnModal, managedColumns } = useColumnModal(tableColumns)

    if (error) {
        return (
            <EmptyState variant={EmptyStateVariant.small} style={{ paddingTop: 64 }}>
                <EmptyStateIcon icon={ExclamationCircleIcon} color="var(--pf-global--danger-color--100)" />
                <Title headingLevel="h2" size="lg">
                    {/* Unable to connect */}
                    {props.errorStateTitle}
                </Title>
                {/* <EmptyStateBody>There was an error retrieving data. Check your connection and reload the page.</EmptyStateBody> */}
                <EmptyStateBody>{error.message}</EmptyStateBody>
            </EmptyState>
        )
    }

    if (itemCount === 0 && Object.keys(filters ?? {}).length === 0) {
        return (
            <EmptyState variant={EmptyStateVariant.large} style={{ paddingTop: 64 }}>
                <EmptyStateIcon icon={PlusCircleIcon} />
                <Title headingLevel="h4" size="lg">
                    {props.emptyStateTitle}
                </Title>
                {props.emptyStateDescription && <EmptyStateBody>{props.emptyStateDescription}</EmptyStateBody>}
                {props.emptyStateButtonClick && (
                    <Button variant="primary" onClick={props.emptyStateButtonClick}>
                        {props.emptyStateButtonText}
                    </Button>
                )}
            </EmptyState>
        )
    }

    return (
        <Fragment>
            {columnModal}
            <PageTableToolbar {...props} openColumnModal={openColumnModal} />
            <div className="pf-c-scroll-inner-wrapper" style={{ height: '100%' }} ref={containerRef} onScroll={onScroll}>
                <TableComposable
                    aria-label="Simple table"
                    variant={props.compact ? 'compact' : settings.tableLayout === 'compact' ? 'compact' : undefined}
                    gridBreakPoint=""
                    isStickyHeader
                >
                    {itemCount === undefined ? (
                        <Thead>
                            <Tr>
                                <Th>
                                    <Skeleton />
                                </Th>
                            </Tr>
                        </Thead>
                    ) : (
                        <TableHead
                            {...props}
                            showSelect={showSelect}
                            scrollLeft={scroll.left > 0}
                            scrollRight={scroll.right > 1}
                            tableColumns={managedColumns}
                            onSelect={onSelect}
                        />
                    )}
                    <Tbody>
                        {itemCount === undefined
                            ? new Array(perPage).fill(0).map((_, index) => (
                                  <Tr key={index}>
                                      <Td>
                                          <div style={{ paddingTop: 5, paddingBottom: 5 }}>
                                              <Skeleton height="27px" />
                                          </div>
                                      </Td>
                                  </Tr>
                              ))
                            : pageItems === undefined
                            ? new Array(Math.min(perPage, itemCount)).fill(0).map((_, index) => (
                                  <Tr key={index}>
                                      {showSelect && <Td></Td>}
                                      <Td colSpan={managedColumns.length}>
                                          <div style={{ paddingTop: 5, paddingBottom: 5 }}>
                                              <Skeleton height="27px" />
                                          </div>
                                      </Td>
                                  </Tr>
                              ))
                            : pageItems?.map((item, rowIndex) => (
                                  <TableRow<T>
                                      key={keyFn ? keyFn(item) : rowIndex}
                                      columns={managedColumns}
                                      item={item}
                                      isItemSelected={isSelected?.(item)}
                                      selectItem={selectItem}
                                      unselectItem={unselectItem}
                                      rowActions={rowActions}
                                      rowIndex={rowIndex}
                                      showSelect={showSelect}
                                      scrollLeft={scroll.left > 0}
                                      scrollRight={scroll.right > 1}
                                      unselectAll={unselectAll}
                                      onSelect={onSelect}
                                  />
                              ))}
                    </Tbody>
                </TableComposable>
                {itemCount === 0 && (
                    <div style={{ margin: 'auto' }}>
                        <EmptyState>
                            <EmptyStateIcon icon={SearchIcon} />
                            <Title headingLevel="h2" size="lg">
                                {t('No results found')}
                            </Title>
                            <EmptyStateBody>
                                {t('No results match this filter criteria. Adjust your filters and try again.')}
                            </EmptyStateBody>
                            {clearAllFilters && (
                                <EmptyStateSecondaryActions>
                                    <Button variant="link" onClick={clearAllFilters}>
                                        {t('Clear all filters')}
                                    </Button>
                                </EmptyStateSecondaryActions>
                            )}
                        </EmptyState>
                    </div>
                )}
            </div>
            {(!props.autoHidePagination || (itemCount ?? 0) > perPage) && <PagePagination {...props} />}
        </Fragment>
    )
}

function TableHead<T extends object>(props: {
    tableColumns: ITableColumn<T>[]
    rowActions?: IItemAction<T>[]
    sort?: string
    setSort?: (sort: string) => void
    sortDirection?: 'asc' | 'desc'
    setSortDirection?: (sortDirection: 'asc' | 'desc') => void
    showSelect?: boolean
    scrollLeft?: boolean
    scrollRight?: boolean
    onSelect?: (item: T) => void
}) {
    const { tableColumns: columns, rowActions: itemActions, sort, setSort, sortDirection, setSortDirection, showSelect, onSelect } = props
    const settings = useSettings()

    const getColumnSort = useCallback<(columnIndex: number, column: ITableColumn<T>) => ThSortType | undefined>(
        (columnIndex: number, column: ITableColumn<T>) => {
            if (!column.sort) return undefined
            return {
                onSort: (_event: MouseEvent, _columnIndex: number, sortByDirection: SortByDirection) => {
                    if (column.sort) {
                        setSort?.(column.sort)
                        setSortDirection?.(sortByDirection)
                    }
                },
                sortBy: {
                    index: column.sort === sort ? columnIndex : undefined,
                    direction: column.sort === sort ? sortDirection : undefined,
                    defaultDirection: column.defaultSortDirection,
                },
                columnIndex,
            }
        },
        [setSort, setSortDirection, sort, sortDirection]
    )

    return (
        <Thead>
            <Tr>
                {(showSelect || onSelect) && (
                    <Th
                        isStickyColumn
                        style={{
                            width: '0%',
                            backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
                        }}
                        stickyMinWidth="45px"
                        hasRightBorder={props.scrollLeft}
                    >
                        &nbsp;
                    </Th>
                )}
                {columns
                    .filter((column) => column.enabled !== false)
                    .map((column, index) => {
                        return (
                            <Th
                                modifier="fitContent"
                                key={column.header}
                                style={{
                                    minWidth: column.minWidth,
                                    maxWidth: column.maxWidth,
                                    backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
                                }}
                                sort={getColumnSort(index, column)}
                            >
                                {column.header}
                            </Th>
                        )
                    })}
                {itemActions !== undefined && (
                    <Th
                        style={{
                            paddingRight: 8,
                            paddingLeft: 0,
                            width: '0%',
                            right: 0,
                            backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
                        }}
                        isStickyColumn
                        stickyMinWidth="45px"
                        className={props.scrollRight ? 'pf-m-border-left' : undefined}
                    >
                        &nbsp;
                    </Th>
                )}
            </Tr>
        </Thead>
    )
}

function TableRow<T extends object>(props: {
    columns: ITableColumn<T>[]
    item: T
    isItemSelected?: boolean
    selectItem?: (item: T) => void
    unselectItem?: (item: T) => void
    rowActions?: IItemAction<T>[]
    rowIndex: number
    showSelect: boolean
    scrollLeft?: boolean
    scrollRight?: boolean
    onSelect?: (item: T) => void
    unselectAll?: () => void
}) {
    const { columns, selectItem, unselectItem, unselectAll, isItemSelected, item, rowActions, rowIndex, showSelect, onSelect } = props
    const md = useBreakpoint('xl')
    return (
        <Tr
            className={isItemSelected ? 'selected' : undefined}
            // style={{ backgroundColor: theme === ThemeE.Dark ? 'transparent' : undefined }}
            isRowSelected={isItemSelected}
            style={{ boxShadow: 'unset' }}
            // isStriped={rowIndex % 2 === 0}
        >
            {showSelect && (
                <Th
                    select={
                        isItemSelected !== undefined
                            ? {
                                  onSelect: (_event, isSelecting) => {
                                      if (isSelecting) {
                                          selectItem?.(item)
                                      } else {
                                          unselectItem?.(item)
                                      }
                                  },
                                  isSelected: isItemSelected,
                              }
                            : undefined
                    }
                    style={{ width: '0%', paddingLeft: md ? undefined : 20, paddingRight: 16 }}
                    isStickyColumn
                    stickyMinWidth="0px"
                    hasRightBorder={props.scrollLeft}
                />
            )}
            {onSelect && (
                <Td
                    select={{
                        rowIndex,
                        onSelect: () => {
                            unselectAll?.()
                            selectItem?.(item)
                            onSelect?.(item)
                        },
                        isSelected: isItemSelected ?? false,
                        // disable: !isRepoSelectable(repo),
                        variant: 'radio',
                    }}
                    style={{
                        width: '0%',
                        paddingLeft: md ? undefined : 20,
                        position: 'sticky',
                        left: 0,
                        background: 'var(--pf-c-table__sticky-column--BackgroundColor)',
                        zIndex: 1,
                    }}
                />
            )}
            <TableCells
                rowIndex={rowIndex}
                columns={columns}
                item={item}
                rowActions={rowActions}
                scrollLeft={props.scrollLeft}
                scrollRight={props.scrollRight}
            />
        </Tr>
    )
}

function TableCells<T extends object>(props: {
    rowIndex: number
    columns: ITableColumn<T>[]
    item: T
    rowActions?: IItemAction<T>[]
    scrollLeft?: boolean
    scrollRight?: boolean
}) {
    // const md = useBreakpoint('xl')

    const { columns, item, rowActions, rowIndex } = props
    const actions: IAction[] | undefined = useMemo(
        () =>
            rowActions?.map((rowAction) => {
                if (isItemActionClick(rowAction)) {
                    const Icon = rowAction.icon
                    return {
                        title: (
                            <Split hasGutter>
                                {Icon && (
                                    <SplitItem>
                                        <Icon />
                                    </SplitItem>
                                )}
                                <SplitItem>{rowAction.label}</SplitItem>
                            </Split>
                        ),
                        onClick: () => {
                            rowAction.onClick(item)
                        },
                    }
                }
                return { isSeparator: true }
            }),
        [item, rowActions]
    )
    return (
        <Fragment>
            {columns
                .filter((column) => column.enabled !== false)
                .map((column) => {
                    return (
                        <Td key={column.header} dataLabel={column.header} modifier="nowrap">
                            {column.cell(item)}
                        </Td>
                    )
                })}
            {actions !== undefined && (
                <Th
                    // isActionCell
                    style={{
                        zIndex: 100 - rowIndex,
                        paddingRight: 8,
                        paddingLeft: 8,
                        width: '0%',
                        right: 0,
                    }}
                    isStickyColumn
                    stickyMinWidth="0px"
                    className={props.scrollRight ? 'pf-m-border-left' : undefined}
                >
                    <ActionsColumn
                        // dropdownDirection="up" // TODO handle....
                        items={actions}
                        // isDisabled={repo.name === '4'} // Also arbitrary for the example
                        // actionsToggle={exampleChoice === 'customToggle' ? customActionsToggle : undefined}
                    />
                </Th>
            )}
        </Fragment>
    )
}

export interface IItemFilter<T extends object> {
    label: string
    type?: 'search' | 'filter'
    options: {
        label: string
        value: string
    }[]
    filter: (item: T, values: string[]) => boolean
}

export type SetFilterValues<T extends object> = (filter: IItemFilter<T>, values: string[]) => void

type CellFn<T extends object> = (item: T) => ReactNode

export interface ITableColumn<T extends object> {
    id?: string
    header: string
    cell: CellFn<T>
    minWidth?: number
    maxWidth?: number
    enabled?: boolean

    sort?: string
    defaultSortDirection?: 'asc' | 'desc'

    /**
     * @deprecated The method should not be used
     */
    type?: 'labels' | 'progress' | 'date'

    /**
     * @deprecated The method should not be used
     */
    sortFn?: (l: T, r: T) => number
}

export type PagePaginationProps = {
    itemCount?: number
    page: number
    perPage: number
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void
    style?: CSSProperties
}

export function PagePagination(props: PagePaginationProps) {
    const { setPage, setPerPage } = props
    const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage])
    const onPerPageSelect = useCallback<OnPerPageSelect>((_event, perPage) => setPerPage(perPage), [setPerPage])
    const sm = useBreakpoint('md')
    const settings = useSettings()
    return (
        <Pagination
            variant={PaginationVariant.bottom}
            itemCount={props.itemCount}
            page={props.page}
            perPage={props.perPage}
            onSetPage={onSetPage}
            onPerPageSelect={onPerPageSelect}
            style={{
                ...props.style,
                borderTop: 'thin solid var(--pf-global--BorderColor--100)',
                boxShadow: 'none',
                zIndex: 301,
                marginTop: -1,
                paddingTop: sm ? 6 : undefined,
                paddingBottom: sm ? 6 : undefined,
                backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
            }}
            // titles={{ items: 'users' }}
        />
    )
}

export function toolbarActionsHaveBulkActions<T extends object>(actions?: ITypedAction<T>[]) {
    if (!actions) return false
    for (const action of actions) {
        if (action.type === 'bulk') return true
    }
    return false
}

export interface IToolbarFilter {
    key: string
    label: string
    type: string
    query: string
}

export type IFilterState = Record<string, string[] | undefined>

export type PagetableToolbarProps<T extends object> = { openColumnModal: () => void } & PageTableProps<T>

export function PageTableToolbar<T extends object>(props: PagetableToolbarProps<T>) {
    const {
        itemCount,
        page,
        perPage,
        setPage,
        setPerPage,
        toolbarFilters,
        selectedItems,
        filters,
        setFilters,
        clearAllFilters,
        // openColumnModal,
    } = props

    const sm = useBreakpoint('sm')

    let { toolbarActions } = props
    toolbarActions = toolbarActions ?? []

    const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage])
    const onPerPageSelect = useCallback<OnPerPageSelect>((_event, perPage) => setPerPage(perPage), [setPerPage])

    const [filterValue, setFilterValue] = useState('')

    const showSearchAndFilters = toolbarFilters !== undefined
    const showToolbarActions = toolbarActions !== undefined && toolbarActions.length > 0

    const showSelect =
        selectedItems !== undefined && toolbarActions && toolbarActions.find((toolbarAction) => TypedActionType.bulk === toolbarAction.type)

    const showToolbar = showSelect || showSearchAndFilters || showToolbarActions

    const [selectedFilter, setSeletedFilter] = useState(() =>
        toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].key : '') : ''
    )

    const settings = useSettings()

    if (!showToolbar) {
        return <Fragment />
    }

    if (itemCount === undefined) {
        return (
            <Toolbar
                style={{
                    borderBottom: 'thin solid var(--pf-global--BorderColor--100)',
                    paddingBottom: sm ? undefined : 8,
                    paddingTop: sm ? undefined : 8,
                    backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
                }}
            >
                <ToolbarContent>
                    <ToolbarItem style={{ width: '100%' }}>
                        <Skeleton height="36px" />
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar>
        )
    }

    return (
        <Toolbar
            clearAllFilters={clearAllFilters}
            style={{
                borderBottom: 'thin solid var(--pf-global--BorderColor--100)',
                paddingBottom: sm ? undefined : 8,
                paddingTop: sm ? undefined : 8,
                backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
            }}
        >
            <ToolbarContent>
                {showSelect && (
                    <ToolbarGroup>
                        <ToolbarItem variant="bulk-select">
                            <BulkSelector {...props} />
                        </ToolbarItem>
                    </ToolbarGroup>
                )}
                {toolbarFilters && toolbarFilters.length > 0 && (
                    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md">
                        <ToolbarGroup variant="filter-group">
                            <ToolbarItem>
                                <SingleSelect2 onChange={setSeletedFilter} value={selectedFilter}>
                                    {toolbarFilters.map((filter) => (
                                        <SelectOption key={filter.key} value={filter.key}>
                                            <Flex
                                                spaceItems={{ default: 'spaceItemsNone' }}
                                                alignItems={{ default: 'alignItemsCenter' }}
                                                flexWrap={{ default: 'nowrap' }}
                                            >
                                                <FlexItem style={{ paddingLeft: 4, paddingRight: 8 }}>
                                                    <FilterIcon />
                                                </FlexItem>
                                                <FlexItem>{filter.label}</FlexItem>
                                            </Flex>
                                        </SelectOption>
                                    ))}
                                </SingleSelect2>
                            </ToolbarItem>
                            <ToolbarItem>
                                <ToolbarTextFilter
                                    value={filterValue}
                                    setValue={setFilterValue}
                                    addFilter={(value: string) => {
                                        let values = filters?.[selectedFilter]
                                        if (!values) values = []
                                        if (!values.includes(value)) values.push(value)
                                        setFilters?.({ ...filters, [selectedFilter]: values })
                                    }}
                                />
                            </ToolbarItem>
                            {toolbarFilters.map((filter) => {
                                const values = filters?.[filter.key] ?? []
                                return (
                                    <ToolbarFilter
                                        key={filter.label}
                                        categoryName={filter.label}
                                        chips={values}
                                        deleteChip={(_group, value) => {
                                            setFilters?.((filters) => {
                                                const newState = { ...filters }
                                                value = typeof value === 'string' ? value : value.key
                                                let values = filters[filter.key]
                                                if (values) {
                                                    values = values.filter((v) => v !== value)
                                                    if (values.length === 0) {
                                                        delete newState[filter.key]
                                                    } else {
                                                        newState[filter.key] = values
                                                    }
                                                }
                                                return newState
                                            })
                                        }}
                                        deleteChipGroup={() => {
                                            setFilters?.((filters) => {
                                                const newState = { ...filters }
                                                delete newState[filter.key]
                                                return newState
                                            })
                                        }}
                                        showToolbarItem={false}
                                    >
                                        <></>
                                    </ToolbarFilter>
                                )
                            })}
                        </ToolbarGroup>
                    </ToolbarToggleGroup>
                )}

                {/* Action Buttons */}
                <ToolbarGroup variant="button-group" style={{ zIndex: 302 }}>
                    <TypedActions actions={toolbarActions} selectedItems={selectedItems} wrapper={ToolbarItem} />
                    {/* <ToolbarItem>
                        <Tooltip content={'Manage columns'}>
                            <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
                        </Tooltip>
                    </ToolbarItem> */}
                </ToolbarGroup>

                {/* {toolbarButtonActions.length > 0 && <ToolbarGroup variant="button-group">{toolbarActionButtons}</ToolbarGroup>} */}
                {/* <ToolbarGroup variant="button-group">{toolbarActionDropDownItems}</ToolbarGroup> */}

                {/* Pagination */}
                <ToolbarItem variant="pagination" visibility={{ default: 'hidden', xl: 'visible' }}>
                    <Pagination
                        variant={PaginationVariant.top}
                        isCompact
                        itemCount={itemCount}
                        perPage={perPage}
                        page={page}
                        onSetPage={onSetPage}
                        onPerPageSelect={onPerPageSelect}
                        style={{ marginTop: -8, marginBottom: -8 }}
                    />
                </ToolbarItem>
            </ToolbarContent>
        </Toolbar>
    )
}

function ToolbarTextFilter(props: { value: string; setValue: (value: string) => void; addFilter: (value: string) => void }) {
    const { value, setValue } = props
    // const ref = useRef<HTMLInputElement>()
    return (
        <InputGroup>
            <TextInputGroup style={{ minWidth: 220 }}>
                <TextInputGroupMain
                    // ref={ref}
                    value={value}
                    onChange={setValue}
                    onKeyUp={(event) => {
                        if (value && event.key === 'Enter') {
                            props.addFilter(value)
                            setValue('')
                            // ref.current?.focus() // Does not work because PF does not expose ref
                        }
                    }}
                />
                {value !== '' && (
                    <TextInputGroupUtilities>
                        <Button
                            variant="plain"
                            aria-label="add filter"
                            onClick={() => setValue('')}
                            style={{ opacity: value ? undefined : 0 }}
                            // tabIndex={value ? undefined : -1}
                            tabIndex={-1}
                        >
                            <TimesIcon />
                        </Button>
                    </TextInputGroupUtilities>
                )}
            </TextInputGroup>

            {!value ? (
                <Button variant={'control'} aria-label="add filter">
                    <SearchIcon />
                </Button>
            ) : (
                <Button
                    variant={value ? 'primary' : 'control'}
                    aria-label="add filter"
                    onClick={() => {
                        props.addFilter(value)
                        setValue('')
                    }}
                >
                    <ArrowRightIcon />
                </Button>
            )}
        </InputGroup>
    )
}

export function Labels(props: { labels: string[] }) {
    return (
        <LabelGroup numLabels={999} isCompact>
            {props.labels.map((label) => (
                <Label isCompact key={label}>
                    {label}
                </Label>
            ))}
        </LabelGroup>
    )
}

export function DateCell(props: { value: number | string }) {
    const date = new Date(props.value)
    return (
        <Split hasGutter>
            <SplitItem>{date.toLocaleDateString()}</SplitItem>
            <SplitItem>{date.toLocaleTimeString()}</SplitItem>
        </Split>
    )
}

export function TextCell(props: {
    icon?: ReactNode
    text?: string
    iconSize?: 'sm' | 'md' | 'lg'
    to?: string
    onClick?: () => void
    textColor?: PatternFlyColor
}) {
    return (
        <Split>
            {props.icon && (
                <SplitItem>
                    <IconWrapper size={props.iconSize ?? 'md'}>{props.icon}</IconWrapper>
                </SplitItem>
            )}
            {props.to ? (
                <SplitItem>
                    {/* <Link to={props.to}>
                        <Truncate position="middle" content={props.text ?? ''} />
                    </Link> */}
                    <Tooltip content={props.text ?? ''}>
                        <div
                            style={{
                                maxWidth: 300,
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                            }}
                        >
                            <Link to={props.to}>{props.text ?? ''}</Link>
                        </div>
                    </Tooltip>
                </SplitItem>
            ) : props.onClick !== undefined ? (
                <SplitItem onClick={props.onClick}>
                    <Button variant="link" isInline>
                        {props.text}
                    </Button>
                </SplitItem>
            ) : (
                <SplitItem style={{ color: props.textColor ? getPatternflyColor(props.textColor) : undefined }}>
                    <Tooltip content={props.text ?? ''}>
                        <div
                            style={{
                                maxWidth: 300,
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                            }}
                        >
                            {props.text ?? ''}
                        </div>
                    </Tooltip>
                </SplitItem>
            )}
        </Split>
    )
}

export function CopyCell(props: { text?: string; minWidth?: number }) {
    if (!props.text) return <></>
    return (
        <ClipboardCopy
            hoverTip="Copy"
            clickTip="Copied"
            variant="inline-compact"
            style={{ display: 'flex', flexWrap: 'nowrap', borderRadius: 4 }}
            onCopy={() => {
                void navigator.clipboard.writeText(props.text ?? '')
            }}
        >
            <Truncate content={props.text} style={{ minWidth: props.minWidth }} />
        </ClipboardCopy>
    )
}

export function SinceCell(props: { value?: string; author?: string; onClick?: () => void; t?: (t: string) => string }) {
    let { t } = props
    t = t ? t : (t: string) => t
    const { author, onClick } = props
    const [dateTime, setDateTime] = useState<string | null>(null)
    useEffect(() => {
        if (props.value) {
            setDateTime(DateTime.fromISO(props.value).toRelative())
        }
        const timeout = setInterval(() => {
            if (props.value) {
                setDateTime(DateTime.fromISO(props.value).toRelative())
            }
        }, 1000)
        return () => clearTimeout(timeout)
    }, [props.value])
    if (props.value === undefined) return <></>
    return (
        <span style={{ whiteSpace: 'nowrap' }}>
            {dateTime}
            {author && <span>&nbsp;{t('by')}&nbsp;</span>}
            {onClick ? (
                <Button variant="link" isInline onClick={onClick}>
                    {author}
                </Button>
            ) : (
                <span>{author}</span>
            )}
        </span>
    )
}
