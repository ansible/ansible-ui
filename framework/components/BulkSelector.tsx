import { Dropdown, DropdownItem, DropdownToggle, DropdownToggleCheckbox } from '@patternfly/react-core'
import { useCallback, useMemo, useState } from 'react'
import { useWindowSizeOrLarger, WindowSize } from './useBreakPoint'

export interface BulkSelectorProps<T> {
    pageItems?: T[]
    selectedItems?: T[]
    selectItems?: (items: T[]) => void
    unselectAll?: () => void
}

export function BulkSelector<T extends object>(props: BulkSelectorProps<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const isSmallOrLarger = useWindowSizeOrLarger(WindowSize.sm)

    const { pageItems, selectedItems, selectItems, unselectAll } = props

    const onToggleCheckbox = useCallback(
        () => (selectedItems?.length ?? 0 > 0 ? unselectAll() : selectItems(pageItems ?? [])),
        [selectedItems, selectItems, unselectAll, pageItems]
    )

    const toggleText = useMemo(() => {
        if (isSmallOrLarger) {
            if (selectedItems && selectedItems.length > 0) {
                return `${selectedItems.length} selected`
            }
            return ''
        } else {
            if (selectedItems && selectedItems.length > 0) {
                return `${selectedItems.length}`
            }
            return ''
        }
    }, [isSmallOrLarger, selectedItems])

    const toggle = useMemo(() => {
        return (
            <DropdownToggle
                splitButtonItems={[
                    <DropdownToggleCheckbox
                        id="select-all"
                        key="select-all"
                        aria-label="Select all"
                        isChecked={selectedItems ? selectedItems.length > 0 : false}
                        onChange={onToggleCheckbox}
                    >
                        {toggleText}
                    </DropdownToggleCheckbox>,
                ]}
                onToggle={(isOpen) => setIsOpen(isOpen)}
            />
        )
    }, [selectedItems, toggleText, onToggleCheckbox])

    const selectNoneDropdownItem = useMemo(() => {
        return (
            <DropdownItem
                id="select-none"
                key="select-none"
                onClick={() => {
                    unselectAll()
                    setIsOpen(false)
                }}
            >
                Select none
            </DropdownItem>
        )
    }, [unselectAll])

    const selectPageDropdownItem = useMemo(() => {
        return (
            <DropdownItem
                id="select-page"
                key="select-page"
                onClick={() => {
                    selectItems(pageItems)
                    setIsOpen(false)
                }}
            >
                {`Select ${pageItems?.length ?? 0} page items`}
            </DropdownItem>
        )
    }, [selectItems, pageItems])

    const dropdownItems = useMemo(() => [selectNoneDropdownItem, selectPageDropdownItem], [selectNoneDropdownItem, selectPageDropdownItem])

    return <Dropdown isOpen={isOpen} toggle={toggle} dropdownItems={dropdownItems} style={{ zIndex: 302 }} />
}
