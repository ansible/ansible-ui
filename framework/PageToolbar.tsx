import {
    Button,
    ButtonVariant,
    Dropdown,
    DropdownItem,
    DropdownSeparator,
    Flex,
    FlexItem,
    InputGroup,
    KebabToggle,
    OnPerPageSelect,
    OnSetPage,
    Pagination,
    PaginationVariant,
    SelectOption,
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
import { ArrowRightIcon, ColumnsIcon, FilterIcon, TimesIcon } from '@patternfly/react-icons'
import { ComponentClass, Dispatch, Fragment, SetStateAction, useCallback, useMemo, useState } from 'react'
import { BulkSelector } from './components/BulkSelector'
import { SingleSelect2 } from './components/SingleSelect'
import { useWindowSizeOrSmaller, WindowSize } from './components/useBreakPoint'

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
    openColumnModal: () => void
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
        openColumnModal,
    } = props
    const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage])
    const onPerPageSelect = useCallback<OnPerPageSelect>((_event, perPage) => setPerPage(perPage), [setPerPage])

    const [filterValue, setFilterValue] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const collapseButtons = useWindowSizeOrSmaller(WindowSize.md)

    const toolbarButtonActions: IToolbarAction<T>[] = useMemo(() => {
        if (collapseButtons) {
            return []
        } else {
            return toolbarActions.filter(
                (action) =>
                    (action.type === ToolbarActionType.button || action.type === ToolbarActionType.bulk) &&
                    (action.variant === ButtonVariant.primary || action.variant === ButtonVariant.secondary)
            )
        }
    }, [collapseButtons, toolbarActions])

    const toolbarDropdownActions: IToolbarAction<T>[] = useMemo(() => {
        if (collapseButtons) {
            return toolbarActions
        } else {
            const actions = toolbarActions.filter(
                (action) =>
                    !(
                        (action.type === ToolbarActionType.button || action.type === ToolbarActionType.bulk) &&
                        (action.variant === ButtonVariant.primary || action.variant === ButtonVariant.secondary)
                    )
            )
            while (actions.length && actions[0].type === ToolbarActionType.seperator) actions.shift()
            while (actions.length && actions[actions.length - 1].type === ToolbarActionType.seperator) actions.pop()
            return actions
        }
    }, [collapseButtons, toolbarActions])

    const dropdownHasBulk = useMemo(() => {
        if (collapseButtons) {
            return toolbarDropdownActions.find((action) => action.type === ToolbarActionType.bulk) !== undefined
        } else {
            return (
                toolbarDropdownActions.find(
                    (action) =>
                        action.type === ToolbarActionType.bulk &&
                        (action.variant === ButtonVariant.primary || action.variant === ButtonVariant.secondary)
                ) !== undefined
            )
        }
    }, [collapseButtons, toolbarDropdownActions])

    const toolbarActionButtons = useMemo(() => {
        if (!toolbarButtonActions.length) return <></>
        return (
            <>
                {toolbarButtonActions
                    ?.map((action) => {
                        switch (action.type) {
                            case ToolbarActionType.button:
                            case ToolbarActionType.bulk: {
                                switch (action.variant) {
                                    case ButtonVariant.primary:
                                    case ButtonVariant.secondary:
                                        return (
                                            <ToolbarItem>
                                                <Button
                                                    variant={
                                                        filterValue
                                                            ? ButtonVariant.secondary
                                                            : selectedItems.length
                                                            ? action.variant === ButtonVariant.primary
                                                                ? ButtonVariant.secondary
                                                                : ButtonVariant.primary
                                                            : action.variant
                                                    }
                                                    onClick={() => action.onClick(selectedItems)}
                                                    isDisabled={action.type === ToolbarActionType.bulk && selectedItems?.length === 0}
                                                >
                                                    {action.label}
                                                </Button>
                                            </ToolbarItem>
                                        )
                                }
                                break
                            }
                        }
                        return undefined
                    })
                    .filter((e) => !!e)}
            </>
        )
    }, [toolbarButtonActions, filterValue, selectedItems])

    const toolbarActionDropDownItems = useMemo(() => {
        if (!toolbarDropdownActions.length) return <></>
        return (
            <Dropdown
                onSelect={() => setDropdownOpen(false)}
                toggle={
                    <KebabToggle
                        id="toggle-kebab"
                        onToggle={() => setDropdownOpen(!dropdownOpen)}
                        toggleVariant={dropdownHasBulk && selectedItems.length ? 'primary' : undefined}
                    />
                }
                isOpen={dropdownOpen}
                isPlain={!dropdownHasBulk || selectedItems.length === 0}
                dropdownItems={toolbarDropdownActions.map((action, index) => {
                    switch (action.type) {
                        case ToolbarActionType.button:
                        case ToolbarActionType.bulk: {
                            const Icon = action.icon
                            return (
                                <DropdownItem
                                    key={action.label}
                                    onClick={() => action.onClick(selectedItems)}
                                    isDisabled={action.type === ToolbarActionType.bulk && selectedItems?.length === 0}
                                    icon={Icon ? <Icon /> : undefined}
                                >
                                    {action.label}
                                </DropdownItem>
                            )
                        }
                        case ToolbarActionType.seperator:
                            return <DropdownSeparator key={`separator-${index}`} />
                    }
                })}
            />
        )
    }, [dropdownHasBulk, dropdownOpen, selectedItems, toolbarDropdownActions])

    const showSearchAndFilters = toolbarFilters !== undefined
    const showToolbarActions = toolbarActions !== undefined

    const showSelect =
        selectedItems !== undefined &&
        toolbarActions &&
        toolbarActions.find((toolbarAction) => ToolbarActionType.bulk === toolbarAction.type)
    const showToolbar = showSelect || showSearchAndFilters || showToolbarActions

    const [selectedFilter, setSeletedFilter] = useState(() =>
        toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].key : '') : ''
    )

    if (!showToolbar) {
        return <Fragment />
    }

    if (itemCount === undefined) {
        return (
            <Toolbar style={{ borderBottom: 'thin solid var(--pf-global--BorderColor--100)' }}>
                <ToolbarContent>
                    <ToolbarItem style={{ width: '100%' }}>
                        <Skeleton height="36px" />
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar>
        )
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
                                    value={filterValue}
                                    setValue={setFilterValue}
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
                <ToolbarGroup variant="button-group">
                    {toolbarActionButtons}
                    {toolbarActionDropDownItems}
                    <ToolbarItem>
                        <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
                    </ToolbarItem>
                </ToolbarGroup>

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

function TextFilter(props: { value: string; setValue: (value: string) => void; addFilter: (value: string) => void }) {
    const { value, setValue } = props
    // const ref = useRef<HTMLInputElement>()
    return (
        <InputGroup>
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
                        // tabIndex={value ? undefined : -1}
                        tabIndex={-1}
                    >
                        <TimesIcon />
                    </Button>
                </TextInputGroupUtilities>
            </TextInputGroup>
            <Button
                variant={value ? 'primary' : 'control'}
                aria-label="add filter"
                onClick={() => {
                    props.addFilter(value)
                    setValue('')
                }}
                isDisabled={!value}
            >
                <ArrowRightIcon />
            </Button>
        </InputGroup>
    )
}
