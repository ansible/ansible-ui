import { Button, ClipboardCopy, Label, LabelGroup, Split, SplitItem, Tooltip, Truncate } from '@patternfly/react-core'
import { DateTime } from 'luxon'
import { ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconWrapper } from './components/IconWrapper'
import { getPatternflyColor, PatternFlyColor } from './components/patternfly-colors'

export function LabelsCell(props: { labels: string[] }) {
    return (
        <LabelGroup numLabels={999} style={{ flexWrap: 'nowrap' }}>
            {props.labels.map((label) => (
                <Label key={label}>{label}</Label>
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
                    {/* <Link to={props.to}>
                        <Truncate position="middle" content={props.text ?? ''} />
                    </Link> */}
                    <Tooltip content={props.text ?? ''}>
                        <div
                            style={{
                                maxWidth: 300,
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                            }}
                        >
                            <Link to={props.to}>{props.text ?? ''}</Link>
                        </div>
                    </Tooltip>
                </SplitItem>
            ) : props.onClick !== undefined ? (
                <SplitItem onClick={props.onClick}>
                    <Button
                        variant="link"
                        isInline
                        style={{
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {props.text}
                    </Button>
                </SplitItem>
            ) : (
                <SplitItem style={{ color: props.textColor ? getPatternflyColor(props.textColor) : undefined }}>
                    <Tooltip content={props.text ?? ''}>
                        <div
                            style={{
                                maxWidth: 300,
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                            }}
                        >
                            {props.text ?? ''}
                        </div>
                    </Tooltip>
                </SplitItem>
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

export function SinceCell(props: { value: string | undefined | null; author?: string; onClick?: () => void; t?: (t: string) => string }) {
    let { t } = props
    t = t ? t : (t: string) => t
    const { author, onClick } = props
    const [dateTime, setDateTime] = useState<string | null>(null)
    useEffect(() => {
        if (props.value) {
            setDateTime(DateTime.fromISO(props.value).toRelative())
        }
        const timeout = setInterval(() => {
            if (props.value) {
                setDateTime(DateTime.fromISO(props.value).toRelative())
            }
        }, 1000)
        return () => clearTimeout(timeout)
    }, [props.value])
    if (props.value === undefined) return <></>
    return (
        <span style={{ whiteSpace: 'nowrap' }}>
            {dateTime}
            {author && <span>&nbsp;{t('by')}&nbsp;</span>}
            {onClick ? (
                <Button variant="link" isInline onClick={onClick}>
                    {author}
                </Button>
            ) : (
                <span>{author}</span>
            )}
        </span>
    )
}
