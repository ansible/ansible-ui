import { Button, ClipboardCopy, Label, LabelGroup, Split, SplitItem, Truncate } from '@patternfly/react-core'
import { DateTime } from 'luxon'
import { Fragment, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconWrapper } from './components/IconWrapper'
import { getPatternflyColor, PatternFlyColor } from './components/patternfly-colors'

type CellFn<T extends object> = (item: T) => ReactNode

export interface ITableColumn<T extends object> {
    id?: string
    header: string
    cell: CellFn<T>
    minWidth?: number
    enabled?: boolean

    sort?: string
    defaultSortDirection?: 'asc' | 'desc'

    /**
     * @deprecated The method should not be used
     */
    type?: 'labels' | 'progress' | 'date'

    /**
     * @deprecated The method should not be used
     */
    sortFn?: (l: T, r: T) => number
}

export function Labels(props: { labels: string[] }) {
    return (
        <LabelGroup numLabels={999} isCompact>
            {props.labels.map((label) => (
                <Label isCompact key={label}>
                    {label}
                </Label>
            ))}
        </LabelGroup>
    )
}

export function DateCell(props: { value: number | string }) {
    const date = new Date(props.value)
    return (
        <Split hasGutter>
            <SplitItem>{date.toLocaleDateString()}</SplitItem>
            <SplitItem>{date.toLocaleTimeString()}</SplitItem>
        </Split>
    )
}

export function TextCell(props: {
    icon?: ReactNode
    text?: string
    iconSize?: 'sm' | 'md' | 'lg'
    to?: string
    onClick?: () => void
    textColor?: PatternFlyColor
}) {
    return (
        <Split>
            {props.icon && (
                <SplitItem>
                    <IconWrapper size={props.iconSize ?? 'md'}>{props.icon}</IconWrapper>
                </SplitItem>
            )}
            {props.to ? (
                <SplitItem>
                    <Link to={props.to}>{props.text}</Link>
                </SplitItem>
            ) : props.onClick ? (
                <SplitItem onClick={props.onClick}>
                    <Button variant="link">{props.text}</Button>
                </SplitItem>
            ) : (
                <SplitItem style={{ color: props.textColor ? getPatternflyColor(props.textColor) : undefined }}>{props.text}</SplitItem>
            )}
        </Split>
    )
}

export function CopyCell(props: { text?: string; minWidth?: number }) {
    if (!props.text) return <></>
    return (
        <ClipboardCopy
            hoverTip="Copy"
            clickTip="Copied"
            variant="inline-compact"
            style={{ display: 'flex', flexWrap: 'nowrap', borderRadius: 4 }}
            onCopy={() => {
                void navigator.clipboard.writeText(props.text ?? '')
            }}
        >
            <Truncate content={props.text} style={{ minWidth: props.minWidth }} />
        </ClipboardCopy>
    )
}

export function SinceCell(props: { value?: string }) {
    if (props.value === undefined) return <></>
    const dateTime = DateTime.fromISO(props.value)
    return <Fragment>{dateTime.toRelative()}</Fragment>
}
