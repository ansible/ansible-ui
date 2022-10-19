import { ReactNode } from 'react'

export function Dotted(props: { children: ReactNode }) {
    return <span style={{ textDecoration: 'underline dotted' }}>{props.children}</span>
}
