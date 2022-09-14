import { FormGroup, Select, SelectOptionObject } from '@patternfly/react-core'
import { CSSProperties, ReactNode, useCallback, useState } from 'react'
import { useOpen } from './useOpen'

export function SingleSelect(props: {
    id?: string
    label: string
    value: string
    onChange: (value: string) => void
    children: ReactNode
    style?: CSSProperties
    open?: boolean
    setOpen?: (open: boolean) => void
}) {
    const { onChange } = props
    const [open, setOpen, onToggle] = useOpen(props)

    const onSelect = useCallback(
        (_e, v: string | SelectOptionObject) => {
            if (typeof v === 'string') {
                onChange(v)
            } else {
                onChange(v.toString())
            }
            setOpen(false)
        },
        [onChange, setOpen]
    )

    const id = props.id ?? props.label.toLocaleLowerCase().split(' ').join('-')
    return (
        <FormGroup label={props.label} fieldId={id} style={props.style}>
            <Select id={id} selections={props.value} isOpen={open} onToggle={onToggle} onSelect={onSelect}>
                {props.children as React.ReactElement[]}
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
