import { useCallback, useEffect, useState } from 'react'

export function useOpen(props: { open?: boolean; setOpen?: (open: boolean) => void }): [boolean, (open: boolean) => void, () => void] {
    const [open, setOpenState] = useState(() => props.open ?? false)
    useEffect(() => {
        if (props.open !== undefined) {
            setOpenState(props.open)
        }
    }, [props.open, setOpenState])

    const setOpen = useCallback(
        (open: boolean) => {
            props.setOpen ? props.setOpen(open) : setOpenState(open)
        },
        [props]
    )

    const onToggle = useCallback(() => {
        setOpen(!open)
    }, [open, setOpen])

    return [open, setOpen, onToggle]
}
