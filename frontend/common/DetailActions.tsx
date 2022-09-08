import { Button, Dropdown, DropdownItem, DropdownPosition, DropdownSeparator, KebabToggle, Split } from '@patternfly/react-core'
import { useCallback, useState } from 'react'
import { IItemAction, isItemActionClick, isItemActionSeperator, useWindowSizeOrLarger, WindowSize } from '../../framework'

export function DetailActions<T>(props: { item?: T; actions: IItemAction<T>[]; position?: DropdownPosition | 'right' | 'left' }) {
    const [open, setOpen] = useState(false)
    const onToggle = useCallback(() => setOpen((open) => !open), [])

    const isXlOrLarger = useWindowSizeOrLarger(WindowSize.md)

    if (!props.item) return <></>

    if (isXlOrLarger) {
        return (
            <Split hasGutter>
                {props.actions.map((action, index) => {
                    if (isItemActionClick(action)) {
                        const Icon = action.icon
                        return (
                            <Button
                                key={action.label}
                                icon={
                                    Icon ? (
                                        <span style={{ paddingRight: 8 }}>
                                            <Icon />
                                        </span>
                                    ) : undefined
                                }
                                onClick={() => (props.item ? action.onClick(props.item) : null)}
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
            dropdownItems={props.actions.map((action, index) => {
                if (isItemActionSeperator(action)) {
                    return <DropdownSeparator key={`seperator-${index}`} />
                }
                if (isItemActionClick(action)) {
                    const Icon = action.icon
                    return (
                        <DropdownItem
                            key={action.label}
                            icon={Icon ? <Icon /> : undefined}
                            onClick={() => (props.item ? action.onClick(props.item) : null)}
                        >
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
