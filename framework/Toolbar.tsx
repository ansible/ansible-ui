import {
    Button,
    ButtonVariant,
    DropdownSeparator,
    Flex,
    FlexItem,
    OnPerPageSelect,
    OnSetPage,
    OverflowMenu,
    OverflowMenuContent,
    OverflowMenuControl,
    OverflowMenuDropdownItem,
    OverflowMenuGroup,
    OverflowMenuItem,
    Pagination,
    PaginationVariant,
    Select,
    SelectOption,
    SelectOptionObject,
    SelectVariant,
    ToggleGroup,
    ToggleGroupItem,
    Toolbar,
    ToolbarContent,
    ToolbarFilter,
    ToolbarGroup,
    ToolbarItem,
    ToolbarToggleGroup,
} from '@patternfly/react-core'
import { ColumnsIcon, FilterIcon, ListIcon, SearchIcon, ThIcon } from '@patternfly/react-icons'
import { ComponentClass, CSSProperties, Fragment, useCallback, useMemo, useState } from 'react'
import { BulkSelector } from './components/BulkSelector'
import { DropdownControlled } from './components/DropdownControlled'
import { SingleSelect2 } from './components/SingleSelect'
import { useWindowSizeOrSmaller, WindowSize } from './components/useBreakPoint'
import { IFilterState, IItemFilter, SetFilterValues } from './ItemFilter'
import { ItemViewTypeE } from './ItemView'

export enum ToolbarActionType {
    seperator = 'seperator',
    button = 'button',
    bulk = 'bulk',
}

export interface IToolbarActionSeperator {
    type: ToolbarActionType.seperator
}

export interface IToolbarActionButton {
    type: ToolbarActionType.button
    variant?: ButtonVariant
    icon?: ComponentClass
    label: string
    onClick: () => void
}

export interface IToolbarBulkAction<T extends object> {
    type: ToolbarActionType.bulk
    variant?: ButtonVariant
    icon?: ComponentClass
    label: string
    onClick: (selectedItems: T[]) => void
}

export type IToolbarAction<T extends object> = IToolbarActionSeperator | IToolbarActionButton | IToolbarBulkAction<T>

export function toolbarActionsHaveBulkActions<T extends object>(actions?: IToolbarAction<T>[]) {
    if (!actions) return false
    for (const action of actions) {
        if (action.type === 'bulk') return true
    }
    return false
}

export function PageToolbar<T extends object>(props: {
    items: T[]
    searched: T[]
    selected: T[]
    perPage: number
    unselectAll: () => void
    selectAll: () => void
    selectPage: () => void
    search: string
    setSearch: (search: string) => void
    page: number
    onSetPage: OnSetPage
    onPerPageSelect: OnPerPageSelect
    view: ItemViewTypeE
    setView: (view: ItemViewTypeE) => void
    filters?: IItemFilter<T>[]
    filterState: IFilterState
    setFilterValues: SetFilterValues<T>
    clearAllFilters: () => void
    openColumnModal: () => void
    toolbarActions?: IToolbarAction<T>[]
    showSearch: boolean
    showViewToggle: boolean
    singular?: string
    plural?: string
    showSelect: boolean
    style?: CSSProperties
}) {
    const {
        items,
        searched,
        selected,
        perPage,
        unselectAll,
        selectAll,
        selectPage,
        search,
        setSearch,
        page,
        onSetPage,
        onPerPageSelect,
        filters,
        filterState,
        setFilterValues,
        view,
        clearAllFilters,
        openColumnModal,
        toolbarActions,
        showSearch,
        showViewToggle,
        singular,
        plural,
        showSelect,
        style,
    } = props
    const clearSearch = useCallback(() => setSearch(''), [setSearch])
    const hideFilters = useWindowSizeOrSmaller(WindowSize.lg)

    // const [theme] = useTheme()

    const toolbarActionButtons = useMemo(
        () => (
            <Fragment>
                {toolbarActions
                    ?.map((action) => {
                        switch (action.type) {
                            case ToolbarActionType.button:
                            case ToolbarActionType.bulk: {
                                const Icon = action.icon
                                switch (action.variant) {
                                    case ButtonVariant.primary:
                                    case ButtonVariant.secondary:
                                        return (
                                            <OverflowMenuItem key={action.label}>
                                                <Button
                                                    variant={action.variant}
                                                    onClick={() => action.onClick(selected)}
                                                    isDisabled={action.type === ToolbarActionType.bulk && selected.length === 0}
                                                    icon={
                                                        Icon ? (
                                                            <span>
                                                                <Icon />
                                                                &nbsp;
                                                            </span>
                                                        ) : undefined
                                                    }
                                                >
                                                    {action.label}
                                                </Button>
                                            </OverflowMenuItem>
                                        )
                                }
                                break
                            }
                        }
                        return undefined
                    })
                    .filter((e) => !!e)}
            </Fragment>
        ),
        [selected, toolbarActions]
    )

    const toolbarActionDropDownItems = useMemo(
        () =>
            toolbarActions
                ?.map((action) => {
                    switch (action.type) {
                        case ToolbarActionType.button:
                        case ToolbarActionType.bulk: {
                            const Icon = action.icon
                            switch (action.variant) {
                                case ButtonVariant.primary:
                                case ButtonVariant.secondary:
                                    return (
                                        <OverflowMenuDropdownItem
                                            key={action.label}
                                            isShared
                                            onClick={() => action.onClick(selected)}
                                            icon={Icon ? <Icon /> : undefined}
                                        >
                                            {action.label}
                                        </OverflowMenuDropdownItem>
                                    )
                                default:
                                    return (
                                        <OverflowMenuDropdownItem
                                            key={action.label}
                                            onClick={() => action.onClick(selected)}
                                            isDisabled={action.type === ToolbarActionType.bulk && selected.length === 0}
                                            icon={Icon ? <Icon /> : undefined}
                                        >
                                            {action.label}
                                        </OverflowMenuDropdownItem>
                                    )
                            }
                        }
                        case 'seperator':
                            return <DropdownSeparator key="separator" />
                    }
                    return undefined
                })
                .filter((a) => !!a),
        [selected, toolbarActions]
    )

    const showSearchAndFilters = showSearch || filters !== undefined
    const showToolbarActions = toolbarActions !== undefined
    const showToolbar = showSelect || showSearchAndFilters || showToolbarActions || showViewToggle

    // const isXlOrLarger = useWindowSizeOrLarger(WindowSize.xl)

    const [selectedFilter, setSeletedFilter] = useState(() => (filters ? (filters?.length > 0 ? filters[0].label : '') : ''))

    if (!showToolbar) {
        return <Fragment />
    }

    return (
        <Toolbar
            clearAllFilters={clearAllFilters}
            // style={{
            //     backgroundColor:
            //         theme === ThemeE.Dark ? 'var(--pf-global--BackgroundColor--300)' : 'var(--pf-global--BackgroundColor--100)',
            // }}
            style={style}
        >
            <ToolbarContent>
                {showSelect && (
                    <ToolbarGroup>
                        <ToolbarItem variant="bulk-select">
                            <BulkSelector
                                itemCount={searched.length}
                                selectedCount={selected.length}
                                perPage={perPage}
                                onSelectNone={unselectAll}
                                onSelectAll={selectAll}
                                onSelectPage={selectPage}
                            />
                        </ToolbarItem>
                    </ToolbarGroup>
                )}
                {filters && filters.length > 0 && (
                    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md">
                        {/* <ToolbarItem variant="search-filter">
                        <SearchInput
                            aria-label="search"
                            placeholder="Search"
                            value={search}
                            onChange={setSearch}
                            onClear={clearSearch}
                            // resultsCount={searched.length !== 0 ? searched.length : undefined}
                        />
                    </ToolbarItem> */}
                        {(view === ItemViewTypeE.Table || hideFilters) && (
                            <ToolbarGroup variant="filter-group">
                                <ToolbarItem>
                                    <SingleSelect2 onChange={setSeletedFilter} value={selectedFilter}>
                                        {filters.map((filter) => (
                                            <SelectOption key={filter.label} value={filter.label}>
                                                <Flex
                                                    spaceItems={{ default: 'spaceItemsSm' }}
                                                    alignItems={{ default: 'alignItemsCenter' }}
                                                    flexWrap={{ default: 'nowrap' }}
                                                >
                                                    <FlexItem>{filter.type === 'search' ? <SearchIcon /> : <FilterIcon />}</FlexItem>
                                                    <FlexItem>{filter.label}</FlexItem>
                                                </Flex>
                                            </SelectOption>
                                        ))}
                                    </SingleSelect2>
                                </ToolbarItem>

                                {filters.map((filter) => {
                                    const values = filterState[filter.label] ?? []
                                    return (
                                        <ToolbarFilter
                                            key={filter.label}
                                            categoryName={filter.label}
                                            chips={values.map((value) => ({
                                                key: value,
                                                node: filter.options.find((option) => option.value === value)?.label ?? value,
                                            }))}
                                            deleteChip={(_group, value) => {
                                                value = typeof value === 'string' ? value : value.key
                                                setFilterValues(
                                                    filter,
                                                    values.filter((v) => v != value)
                                                )
                                            }}
                                            deleteChipGroup={() => setFilterValues(filter, [])}
                                            showToolbarItem={selectedFilter === filter.label}
                                        >
                                            <SelectFilter
                                                label={'All'}
                                                values={values}
                                                setValues={(values) => setFilterValues(filter, values)}
                                                options={filter.options}
                                            />
                                        </ToolbarFilter>
                                    )
                                })}
                            </ToolbarGroup>
                        )}
                    </ToolbarToggleGroup>
                )}
                {showToolbarActions && (
                    <ToolbarGroup variant="button-group">
                        <ToolbarItem>
                            <OverflowMenu breakpoint="md">
                                {toolbarActionButtons && (
                                    <OverflowMenuContent>
                                        <OverflowMenuGroup groupType="button">{toolbarActionButtons}</OverflowMenuGroup>
                                    </OverflowMenuContent>
                                )}
                                <OverflowMenuControl hasAdditionalOptions>
                                    <DropdownControlled items={toolbarActionDropDownItems ?? []} />
                                </OverflowMenuControl>
                            </OverflowMenu>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
                        </ToolbarItem>
                    </ToolbarGroup>
                )}
                {/* {view === ItemViewTypeE.Table && <ToolbarGroup variant="button-group"></ToolbarGroup>} */}
                <ToolbarItem variant="pagination" />
                {/* <ToolbarItem>
                    {searched.length < items.length ? (
                        <span>
                            {searched.length} of {items.length}
                        </span>
                    ) : (
                        <span>{items.length}</span>
                    )}
                    {items.length == 1 ? singular && ' ' + singular : plural && ' ' + plural}
                </ToolbarItem> */}
                {showViewToggle !== false && (
                    <ToolbarItem>
                        <ToggleGroup>
                            <ToggleGroupItem
                                aria-label="list"
                                icon={<ListIcon />}
                                isSelected={props.view === ItemViewTypeE.Table}
                                onClick={() => props.setView(ItemViewTypeE.Table)}
                            />
                            <ToggleGroupItem
                                aria-label="catalog"
                                icon={<ThIcon />}
                                isSelected={props.view === ItemViewTypeE.Catalog}
                                onClick={() => props.setView(ItemViewTypeE.Catalog)}
                            />
                        </ToggleGroup>
                    </ToolbarItem>
                )}
                <ToolbarItem visibility={{ default: 'hidden', lg: 'visible' }}>
                    <Pagination
                        variant={PaginationVariant.top}
                        isCompact
                        itemCount={searched.length}
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

function SelectFilter(props: {
    label: string
    values: string[]
    setValues: (values: string[]) => void
    options: { label: string; value: string }[]
}) {
    const [open, setOpen] = useState(false)
    const onToggle = useCallback(() => setOpen((open) => !open), [])
    const onSelect = useCallback(
        (event: React.MouseEvent | React.ChangeEvent, value: string | SelectOptionObject, isPlaceholder?: boolean) => {
            event.preventDefault()
            if (isPlaceholder) {
                props.setValues([])
            } else {
                if (props.values.includes(value.toString())) {
                    const newValues = [...props.values]
                    newValues.splice(props.values.indexOf(value.toString()), 1)
                    props.setValues(newValues)
                } else {
                    props.setValues([...props.values, value.toString()])
                }
            }
        },
        [props]
    )
    const options = useMemo(
        () =>
            props.options.map((option) => (
                <SelectOption key={option.label} value={option.value}>
                    {option.label}
                </SelectOption>
            )),
        [props.options]
    )
    return (
        <Select
            // placeholder="hhh"
            variant={SelectVariant.checkbox}
            aria-label="Status"
            onToggle={onToggle}
            onSelect={onSelect}
            selections={props.values}
            isOpen={open}
            placeholderText={props.values.length === 0 ? props.label : undefined}
            // toggleIcon={<SearchIcon />}
            // placeholderText="jjj"

            onClear={
                props.values.length !== 0
                    ? () => {
                          props.setValues([])
                      }
                    : undefined
            }
        >
            {options}
        </Select>
    )
}
