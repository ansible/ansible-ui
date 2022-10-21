import {
    Button,
    ClipboardCopy,
    Flex,
    FlexItem,
    Label,
    LabelGroup,
    Split,
    SplitItem,
    Tooltip,
    Truncate,
} from '@patternfly/react-core'
import { DateTime } from 'luxon'
import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { IconWrapper } from './components/IconWrapper'
import { getPatternflyColor, PatternFlyColor } from './components/patternfly-colors'
import { useSettings } from './Settings'

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
                <SplitItem
                    style={{
                        color: props.textColor ? getPatternflyColor(props.textColor) : undefined,
                    }}
                >
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

export function SinceCell(props: {
    value: string | undefined | null
    author?: string
    onClick?: () => void
    t?: (t: string) => string
}) {
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

export function CapacityCell(props: { format?: string; used: number; capacity: number }) {
    const { t } = useTranslation()
    const settings = useSettings()
    const ratio = props.used / props.capacity
    if (props.capacity === 0) return <></>
    const base =
        ratio >= 0.8
            ? 'var(--pf-global--palette--red'
            : ratio >= 0.5
            ? 'var(--pf-global--palette--gold'
            : 'var(--pf-global--palette--green'
    const color1 = settings.theme === 'light' ? `${base}-100)` : `${base}-600)`
    const color2 = settings.theme === 'light' ? `${base}-400)` : `${base}-200)`
    const borderColor = settings.theme === 'light' ? `#0002` : `#fff2`
    return (
        <Flex
            alignItems={{ default: 'alignItemsBaseline' }}
            spaceItems={{ default: 'spaceItemsSm' }}
        >
            {props.capacity > 0 && (
                <FlexItem>
                    <div
                        style={{
                            width: 18,
                            height: 25,
                            background: color1,
                            marginBottom: -9,
                            paddingTop: Math.max(
                                0,
                                Math.min(25, (25 * (props.capacity - props.used)) / props.capacity)
                            ),
                            borderRadius: 2,
                            border: `thin solid ${borderColor}`,
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: color2,
                                borderRadius: 2,
                            }}
                        ></div>
                    </div>
                </FlexItem>
            )}
            {props.format ? (
                <FlexItem>
                    {props.format
                        .replace('{used}', props.used.toString())
                        .replace('{capacity}', props.capacity.toString())}
                </FlexItem>
            ) : (
                <FlexItem>
                    {props.used}
                    {t(' of ')}
                    {props.capacity}
                </FlexItem>
            )}
        </Flex>
    )
}

export function BytesCell(props: { bytes: number; decimals?: number }) {
    const { bytes } = props
    if (!+bytes) return <></>

    const k = 1024
    const decimals = props.decimals ? props.decimals : 0
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return <>{`${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`}</>
}
