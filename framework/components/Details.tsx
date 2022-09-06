import {
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Split,
    SplitItem,
    Stack,
} from '@patternfly/react-core'
import { ComponentClass, ReactNode } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { CopyCell, SinceCell } from '../TableColumn'
import { Help } from './Help'
import { IconWrapper } from './IconWrapper'

export interface IDetailText {
    label: string
    icon?: ComponentClass
    text?: string
    helpTitle?: string
    help?: ReactNode
    to?: string
    link?: string
    color?: string
    copy?: boolean
    since?: boolean
}

export function isDetailText(detail: IDetail): detail is IDetailText {
    return 'label' in detail && !('items' in detail)
}

export interface IDetailList {
    label: string
    icon?: ComponentClass
    items: IDetailListItem[]
}

export function isDetailList(detail: IDetail): detail is IDetailList {
    return 'items' in detail && 'label' in detail
}

export interface IDetailListItem {
    icon?: ComponentClass
    text: string
    helpTitle?: string
    help?: ReactNode
}

export type IDetail = IDetailText | IDetailList

export function Details(props: { details: IDetail[] }) {
    const { details } = props

    return (
        <DescriptionList orientation={{ sm: 'vertical', md: 'horizontal', lg: 'horizontal', xl: 'horizontal', '2xl': 'horizontal' }}>
            {details.map((detail, index) => {
                if (isDetailText(detail)) {
                    if (!detail.text) return <></>
                    const Icon = detail.icon
                    return (
                        <DescriptionListGroup key={index}>
                            <DescriptionListTerm>{detail.label}</DescriptionListTerm>
                            <DescriptionListDescription>
                                <Split key={index}>
                                    {Icon && (
                                        <IconWrapper size="sm">
                                            <Icon />
                                        </IconWrapper>
                                    )}
                                    {detail.to ? (
                                        <Link to={detail.to}>{detail.text}</Link>
                                    ) : detail.link ? (
                                        <a href={detail.link} target="_blank" rel="noreferrer">
                                            {detail.text}
                                        </a>
                                    ) : detail.color ? (
                                        <span style={{ color: detail.color }}>{detail.text}</span>
                                    ) : detail.copy ? (
                                        <CopyCell text={detail.text} />
                                    ) : detail.since ? (
                                        <SinceCell value={detail.text} />
                                    ) : (
                                        detail.text
                                    )}
                                    {detail.help && <Help title={detail.helpTitle} help={detail.help} />}
                                </Split>
                            </DescriptionListDescription>
                        </DescriptionListGroup>
                    )
                } else if (isDetailList(detail)) {
                    return (
                        <DescriptionListGroup key={index}>
                            <DescriptionListTerm>{detail.label}</DescriptionListTerm>
                            <DescriptionListDescription>
                                <Stack hasGutter>
                                    {detail.items.map((item, index) => {
                                        const Icon = item.icon
                                        return (
                                            <Split key={index} hasGutter>
                                                {Icon && <SplitItem>{item.icon}</SplitItem>}
                                                <SplitItem>{item.text}</SplitItem>
                                                {item.help && <Help title={item.helpTitle} help={item.help} />}
                                            </Split>
                                        )
                                    })}
                                </Stack>
                            </DescriptionListDescription>
                        </DescriptionListGroup>
                    )
                } else return <></>
            })}
        </DescriptionList>
    )
}

export function DetailsList(props: { children?: ReactNode }) {
    return (
        <DescriptionList
            orientation={{ sm: 'vertical', md: 'vertical', lg: 'vertical', xl: 'vertical', '2xl': 'vertical' }}
            columnModifier={{ default: '3Col' }}
        >
            {props.children}
        </DescriptionList>
    )
}

export function Detail(props: { label: string; children?: ReactNode }) {
    const history = useHistory()
    if (!props.children) return <></>
    return (
        <DescriptionListGroup>
            <DescriptionListTerm>{props.label}</DescriptionListTerm>
            <DescriptionListDescription>{props.children}</DescriptionListDescription>
        </DescriptionListGroup>
    )
}
