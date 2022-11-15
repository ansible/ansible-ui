import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Skeleton,
  Stack,
  Text,
} from '@patternfly/react-core'
import { ComponentClass, ReactNode } from 'react'
import { useSettings } from '../Settings'

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

export function DetailsList(props: { children?: ReactNode }) {
  const settings = useSettings()
  const orientation = settings.formLayout
  const columns = settings.formColumns
  const isCompact = false
  return (
    <DescriptionList
      orientation={{
        sm: orientation,
        md: orientation,
        lg: orientation,
        xl: orientation,
        '2xl': orientation,
      }}
      columnModifier={
        columns === 'multiple'
          ? {
              default: '1Col',
              sm: '1Col',
              md: '2Col',
              lg: '2Col',
              xl: '3Col',
              '2xl': '3Col',
            }
          : undefined
      }
      style={{ maxWidth: 1200, padding: isCompact ? undefined : 8 }}
      isCompact={isCompact}
    >
      {props.children}
    </DescriptionList>
  )
}

export function Detail(props: { label?: string; children?: ReactNode }) {
  if (!props.children) return <></>
  return (
    <DescriptionListGroup>
      {props.label && (
        <DescriptionListTerm>
          <Text component="small" style={{ opacity: 0.7 }}>
            {props.label}
          </Text>
        </DescriptionListTerm>
      )}
      <DescriptionListDescription id={props.label?.toLowerCase().split(' ').join('-')}>
        {props.children}
      </DescriptionListDescription>
    </DescriptionListGroup>
  )
}

export function DetailsSkeleton() {
  return (
    <Stack hasGutter>
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </Stack>
  )
}
