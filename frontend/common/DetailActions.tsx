import { Button, Dropdown, DropdownItem, DropdownPosition, DropdownSeparator, KebabToggle, Split } from '@patternfly/react-core'
import { useCallback, useState } from 'react'
import { IItemAction, isItemActionClick, isItemActionSeperator, useWindowSizeOrLarger, WindowSize } from '../../framework'

export function DetailActions<T>(props: { item: T; actions: IItemAction<T>[]; position?: DropdownPosition | 'right' | 'left' }) {
    const [open, setOpen] = useState(false)
    const onToggle = useCallback(() => setOpen((open) => !open), [])

    const isXlOrLarger = useWindowSizeOrLarger(WindowSize.md)

    if (isXlOrLarger) {
        return (
            <Split hasGutter>
                {props.actions.map((action, index) => {
                    if (isItemActionClick(action)) {
                        const Icon = action.icon
                        return (
                            <Button
                                icon={
                                    Icon ? (
                                        <span style={{ paddingRight: 8 }}>
                                            <Icon />
                                        </span>
                                    ) : undefined
                                }
                                onClick={() => action.onClick(props.item)}
                                variant={index === 0 ? 'primary' : 'secondary'}
                            >
                                {action.label}
                            </Button>
                        )
                    }
                    return <></>
                })}
            </Split>
        )
    }

    return (
        <Dropdown
            toggle={<KebabToggle onToggle={onToggle} isPlain />}
            isOpen={open}
            isPlain
            dropdownItems={props.actions.map((action) => {
                if (isItemActionSeperator(action)) {
                    return <DropdownSeparator />
                }
                if (isItemActionClick(action)) {
                    const Icon = action.icon
                    return (
                        <DropdownItem icon={Icon ? <Icon /> : undefined} onClick={() => action.onClick(props.item)}>
                            {action.label}
                        </DropdownItem>
                    )
                }
                return <></>
            })}
            position={props.position ?? DropdownPosition.right}
        />
    )
}
