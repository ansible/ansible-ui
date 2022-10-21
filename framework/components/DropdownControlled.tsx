import { Dropdown, KebabToggle } from '@patternfly/react-core'
import { ReactNode, useCallback, useState } from 'react'

export function DropdownControlled(props: { items: ReactNode[] }) {
    const [open, setOpen] = useState(false)
    const onToggle = useCallback(() => setOpen((open) => !open), [])
    return (
        <Dropdown
            toggle={<KebabToggle onToggle={onToggle} />}
            isOpen={open}
            isPlain
            dropdownItems={props.items}
        />
    )
}
