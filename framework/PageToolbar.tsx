import {
    Button,
    Flex,
    FlexItem,
    InputGroup,
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
    Tooltip,
} from '@patternfly/react-core'
import { ArrowRightIcon, ColumnsIcon, FilterIcon, SearchIcon, TimesIcon } from '@patternfly/react-icons'
import { Dispatch, Fragment, SetStateAction, useCallback, useState } from 'react'
import { BulkSelector } from './components/BulkSelector'
import { SingleSelect2 } from './components/SingleSelect'
import { useBreakpoint } from './components/useBreakPoint'
import { useSettings } from './Settings'
import { ITypedAction, TypedActions, TypedActionType } from './TypedActions'

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

export type PagetableToolbarProps<T extends object> = {
    openColumnModal: () => void
    keyFn: (item: T) => string | number

    itemCount?: number

    toolbarActions?: ITypedAction<T>[]

    toolbarFilters?: IToolbarFilter[]
    filters?: Record<string, string[]>
    setFilters?: Dispatch<SetStateAction<Record<string, string[]>>>
    clearAllFilters?: () => void

    page: number
    perPage: number
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void

    isSelected?: (item: T) => boolean
    selectedItems?: T[]
    selectItem?: (item: T) => void
    unselectItem?: (item: T) => void
    selectItems?: (items: T[]) => void
    unselectAll?: () => void
    onSelect?: (item: T) => void
}

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
        openColumnModal,
    } = props

    const sm = useBreakpoint('md')

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
                    <ToolbarItem>
                        <Tooltip content={'Manage columns'}>
                            <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
                        </Tooltip>
                    </ToolbarItem>
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
