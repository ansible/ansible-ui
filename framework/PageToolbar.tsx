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
    Skeleton,
    TextInputGroup,
    TextInputGroupMain,
    TextInputGroupUtilities,
    Toolbar,
    ToolbarContent,
    ToolbarFilter,
    ToolbarGroup,
    ToolbarItem,
    ToolbarToggleGroup,
} from '@patternfly/react-core'
import { FilterIcon, TimesIcon } from '@patternfly/react-icons'
import { ComponentClass, Dispatch, Fragment, SetStateAction, useCallback, useMemo, useState } from 'react'
import { BulkSelector } from './components/BulkSelector'
import { DropdownControlled } from './components/DropdownControlled'
import { SingleSelect2 } from './components/SingleSelect'

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
    filters: Record<string, string[]>
    setFilters: Dispatch<SetStateAction<Record<string, string[]>>>
    clearAllFilters: () => void
}

export function PageToolbar2<T extends object>(props: PageToolbar2Props<T>) {
    const {
        itemCount,
        page,
        perPage,
        setPage,
        setPerPage,
        toolbarFilters,
        toolbarActions,
        selectedItems,
        filters,
        setFilters,
        clearAllFilters,
    } = props
    const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage])
    const onPerPageSelect = useCallback<OnPerPageSelect>((_event, perPage) => setPerPage(perPage), [setPerPage])

    const toolbarActionButtons = useMemo(
        () => (
            <Fragment>
                {toolbarActions
                    ?.map((action) => {
                        switch (action.type) {
                            case ToolbarActionType.button:
                            case ToolbarActionType.bulk: {
                                // const Icon = action.icon
                                switch (action.variant) {
                                    case ButtonVariant.primary:
                                    case ButtonVariant.secondary:
                                        return (
                                            <OverflowMenuItem key={action.label}>
                                                <Button
                                                    variant={action.variant}
                                                    onClick={() => action.onClick(selectedItems)}
                                                    isDisabled={action.type === ToolbarActionType.bulk && selectedItems?.length === 0}
                                                    // icon={
                                                    //     Icon ? (
                                                    //         <span>
                                                    //             <Icon />
                                                    //             &nbsp;
                                                    //         </span>
                                                    //     ) : undefined
                                                    // }
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
        toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].key : '') : ''
    )

    if (!showToolbar) {
        return <Fragment />
    }

    if (itemCount === undefined) {
        return (
            <Toolbar
            //  style={{ borderBottom: 'thin solid var(--pf-global--BorderColor--100)' }}
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
            // style={{ borderBottom: 'thin solid var(--pf-global--BorderColor--100)' }}
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
                                <TextFilter
                                    addFilter={(value: string) => {
                                        let values = filters[selectedFilter]
                                        if (!values) values = []
                                        if (!values.includes(value)) values.push(value)
                                        setFilters({ ...filters, [selectedFilter]: values })
                                    }}
                                />
                            </ToolbarItem>
                            {toolbarFilters.map((filter) => {
                                const values = filters[filter.key] ?? []
                                return (
                                    <ToolbarFilter
                                        key={filter.label}
                                        categoryName={filter.label}
                                        chips={values}
                                        deleteChip={(_group, value) => {
                                            setFilters((filters) => {
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
                                            setFilters((filters) => {
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

function TextFilter(props: { addFilter: (value: string) => void }) {
    const [value, setValue] = useState('')
    // const ref = useRef<HTMLInputElement>()
    return (
        <TextInputGroup>
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
            <TextInputGroupUtilities>
                <Button
                    variant="plain"
                    aria-label="add filter"
                    onClick={() => setValue('')}
                    style={{ opacity: value ? undefined : 0 }}
                    tabIndex={value ? undefined : -1}
                >
                    <TimesIcon />
                </Button>
                {/* <Button
                    variant="plain"
                    aria-label="add filter"
                    onClick={() => props.setFilter(value)}
                    style={{ opacity: value ? undefined : 0 }}
                    tabIndex={-1}
                >
                    <SearchPlusIcon />
                </Button> */}
            </TextInputGroupUtilities>
        </TextInputGroup>
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
