import {
    Button,
    DataList,
    DataListAction,
    DataListCell,
    DataListCheck,
    DataListItem,
    DataListItemCells,
    DataListItemRow,
    DropdownPosition,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    EmptyStateVariant,
    Title,
} from '@patternfly/react-core'
import { ExclamationCircleIcon, PlusCircleIcon } from '@patternfly/react-icons'
import { Dispatch, Fragment, ReactNode, SetStateAction } from 'react'
import { Scrollable } from './components/Scrollable'
import { PageBody } from './PageBody'
import { PageHeader, PageHeaderProps } from './PageHeader'
import { PageLayout } from './PageLayout'
import { PagePagination } from './PagePagination'
import { IToolbarFilter, PageTableToolbar } from './PageToolbar'
import { useSettings } from './Settings'
import { ITypedAction, TypedActions, TypedActionType } from './TypedActions'

export type DataListPageProps<T extends object> = PageHeaderProps &
    PageDataListProps<T> & { error?: Error }

export function DataListPage<T extends object>(props: DataListPageProps<T>) {
    return (
        <>
            <PageLayout>
                <PageHeader {...props} />
                <PageBody>
                    <PageDataList {...props} />
                </PageBody>
            </PageLayout>
        </>
    )
}

export type PageDataListProps<T extends object> = {
    keyFn: (item: T) => string | number

    itemCount?: number
    pageItems: T[] | undefined

    toolbarActions?: ITypedAction<T>[]

    dataCells: ((item: T) => ReactNode)[]
    actions: ITypedAction<T>[]

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

export function PageDataList<T extends object>(props: PageDataListProps<T>) {
    const {
        pageItems,
        selectItem,
        unselectItem,
        isSelected,
        keyFn,
        toolbarActions,
        itemCount,
        perPage,
        // clearAllFilters,
        filters,
        error,
        dataCells,
    } = props
    const showSelect =
        toolbarActions?.find((toolbarAction) => TypedActionType.bulk === toolbarAction.type) !==
        undefined
    const settings = useSettings()

    if (error) {
        return (
            <div
                style={{
                    backgroundColor:
                        settings.theme === 'dark'
                            ? 'var(--pf-global--BackgroundColor--300)'
                            : undefined,
                    height: '100%',
                }}
            >
                <EmptyState
                    variant={EmptyStateVariant.small}
                    style={{
                        paddingTop: 64,
                    }}
                >
                    <EmptyStateIcon
                        icon={ExclamationCircleIcon}
                        color="var(--pf-global--danger-color--100)"
                    />
                    <Title headingLevel="h2" size="lg">
                        {/* Unable to connect */}
                        {props.errorStateTitle}
                    </Title>
                    {/* <EmptyStateBody>There was an error retrieving data. Check your connection and reload the page.</EmptyStateBody> */}
                    <EmptyStateBody>{error.message}</EmptyStateBody>
                </EmptyState>
            </div>
        )
    }

    if (itemCount === 0 && Object.keys(filters ?? {}).length === 0) {
        return (
            <EmptyState variant={EmptyStateVariant.large} style={{ paddingTop: 64 }}>
                <EmptyStateIcon icon={PlusCircleIcon} />
                <Title headingLevel="h4" size="lg">
                    {props.emptyStateTitle}
                </Title>
                {props.emptyStateDescription && (
                    <EmptyStateBody>{props.emptyStateDescription}</EmptyStateBody>
                )}
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
            <PageTableToolbar {...props} disableBorderBottom />
            <Scrollable>
                <DataList aria-label="Simple data list example">
                    {pageItems?.map((item) => (
                        <DataListItem aria-labelledby="simple-item1" key={keyFn(item)}>
                            <DataListItemRow>
                                {showSelect && (
                                    <DataListCheck
                                        aria-labelledby="check-action-item1"
                                        name="check-action-check1"
                                        isChecked={isSelected?.(item)}
                                        onClick={() => {
                                            if (isSelected?.(item)) {
                                                selectItem?.(item)
                                            } else {
                                                unselectItem?.(item)
                                            }
                                        }}
                                    />
                                )}
                                <DataListItemCells
                                    dataListCells={dataCells.map((dataCell, index) => (
                                        <DataListCell
                                            width={index === 0 ? 5 : 1}
                                            key="primary content"
                                        >
                                            <span id="simple-item1">{dataCell(item)}</span>
                                        </DataListCell>
                                    ))}
                                />
                                {props.actions && <DataListActions actions={props.actions} />}
                            </DataListItemRow>
                        </DataListItem>
                    ))}
                </DataList>
            </Scrollable>
            {(!props.autoHidePagination || (itemCount ?? 0) > perPage) && (
                <PagePagination {...props} />
            )}
        </Fragment>
    )
}

function DataListActions<T extends object>(props: { actions: ITypedAction<T>[] }) {
    return (
        <DataListAction
            aria-labelledby="check-action-item1 check-action-action1"
            id="check-action-action1"
            aria-label="Actions"
            isPlainButtonAction
            style={{ whiteSpace: 'nowrap' }}
        >
            <TypedActions actions={props.actions} position={DropdownPosition.right}></TypedActions>
        </DataListAction>
    )
}
