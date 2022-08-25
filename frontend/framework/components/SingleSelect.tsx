import { FormGroup, Select, SelectOption } from '@patternfly/react-core'
import { ReactNode, useCallback, useState } from 'react'

export function SingleSelect(props: { options: string[]; value?: string; onChange: (value: string) => void; label?: string }) {
    const [open, setOpen] = useState(false)
    const onToggle = useCallback(() => {
        setOpen((open) => !open)
    }, [])
    const onSelect = useCallback(
        (_e, v) => {
            props.onChange(v)
            setOpen(false)
        },
        [props]
    )
    const id = '111'
    return (
        <FormGroup label={props.label} fieldId={id}>
            <Select id={id} selections={props.value} isOpen={open} onToggle={onToggle} onSelect={onSelect}>
                {props.options.map((option) => (
                    <SelectOption key={option} value={option}>
                        {option}
                    </SelectOption>
                ))}
            </Select>
        </FormGroup>
    )
}

export function SingleSelect2(props: {
    id?: string
    children: ReactNode
    value?: string
    onChange: (value: string) => void
    label?: string
}) {
    const { id } = props
    const [open, setOpen] = useState(false)
    const onToggle = useCallback(() => {
        setOpen((open) => !open)
    }, [])
    const onSelect = useCallback(
        (_e, v) => {
            props.onChange(v)
            setOpen(false)
        },
        [props]
    )
    return (
        <Select id={id} selections={props.value} isOpen={open} onToggle={onToggle} onSelect={onSelect}>
            {props.children as any}
        </Select>
    )
}
