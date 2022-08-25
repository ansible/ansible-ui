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
    Toolbar,
    ToolbarContent,
    ToolbarGroup,
    ToolbarItem,
    ToolbarToggleGroup,
} from '@patternfly/react-core'
import { FilterIcon, SearchIcon } from '@patternfly/react-icons'
import { ComponentClass, Fragment, useCallback, useMemo, useState } from 'react'
import { BulkSelector } from './components/BulkSelector'
import { DropdownControlled } from './components/DropdownControlled'
import { SingleSelect2 } from './components/SingleSelect'
import { IItemFilter } from './ItemFilter'

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

export interface IToolbarFilter {
    key: string
    label: string
    type: string
    query: string
}

export type IFilterState = Record<string, string[] | undefined>

export type PageToolbar2Props<T extends object> = {
    itemCount?: number
    pageItems?: T[]
    toolbarFilters?: IToolbarFilter[]
    toolbarActions?: IToolbarAction<T>[]
    page: number
    perPage: number
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void
    keyFn?: (item: T) => string | number
    selectedItems?: T[]
    selectItems?: (items: T[]) => void
    unselectAll?: () => void
}

export function PageToolbar2<T extends object>(props: PageToolbar2Props<T>) {
    const { itemCount, page, perPage, setPage, setPerPage, toolbarFilters, toolbarActions, selectedItems } = props

    const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage])
    const onPerPageSelect = useCallback<OnPerPageSelect>((_event, perPage) => setPerPage(perPage), [setPerPage])

    const [filterState, setFilterState] = useState<IFilterState>(() => {
        const filterState: IFilterState = {}
        // searchParams.forEach((value, key) => {
        //     switch (key) {
        //         case 'view':
        //         case 'route':
        //         case 'search':
        //             break
        //         default:
        //             filterState[key] = value.split(',')
        //     }
        // })
        return filterState
    })
    const setFilterValues = useCallback((filter: IItemFilter<T>, values: string[]) => {
        setFilterState((filtersState) => ({ ...filtersState, ...{ [filter.label]: values } }))
    }, [])
    const clearAllFilters = useCallback(() => {
        setFilterState({})
    }, [])

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
                                                    onClick={() => action.onClick(selectedItems)}
                                                    isDisabled={action.type === ToolbarActionType.bulk && selectedItems?.length === 0}
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
        [selectedItems, toolbarActions]
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
                                            onClick={() => action.onClick(selectedItems)}
                                            icon={Icon ? <Icon /> : undefined}
                                        >
                                            {action.label}
                                        </OverflowMenuDropdownItem>
                                    )
                                default:
                                    return (
                                        <OverflowMenuDropdownItem
                                            key={action.label}
                                            onClick={() => action.onClick(selectedItems)}
                                            isDisabled={action.type === ToolbarActionType.bulk && selectedItems?.length === 0}
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
        [selectedItems, toolbarActions]
    )

    const showSearchAndFilters = toolbarFilters !== undefined
    const showToolbarActions = toolbarActions !== undefined

    const showSelect =
        selectedItems !== undefined &&
        toolbarActions &&
        toolbarActions.find((toolbarAction) => ToolbarActionType.bulk === toolbarAction.type)
    const showToolbar = showSelect || showSearchAndFilters || showToolbarActions

    // const isXlOrLarger = useWindowSizeOrLarger(WindowSize.xl)

    const [selectedFilter, setSeletedFilter] = useState(() =>
        toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].label : '') : ''
    )

    if (!showToolbar) {
        return <Fragment />
    }

    return (
        <Toolbar clearAllFilters={clearAllFilters} style={{ borderBottom: 'thin solid var(--pf-global--BorderColor--100)' }}>
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
                            {/* {toolbarFilters.map((filter) => {
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
                            })} */}
                        </ToolbarGroup>
                    </ToolbarToggleGroup>
                )}

                {/* Action Buttons */}
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
                        {/* <ToolbarItem>
                            <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
                        </ToolbarItem> */}
                    </ToolbarGroup>
                )}

                {/* Pagination */}
                <ToolbarItem variant="pagination" visibility={{ default: 'hidden', lg: 'visible' }}>
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
