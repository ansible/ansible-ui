import { Split, SplitItem } from '@patternfly/react-core'
import { ReactNode } from 'react'
import { IconWrapper } from '../components/IconWrapper'
import { getPatternflyColor, PFColor } from '../components/pfcolors'
import { usePageNavigate } from '../components/usePageNavigate'

export interface TextCellProps {
  icon?: ReactNode
  iconSize?: 'sm' | 'md' | 'lg'
  text?: string
  to?: string
  onClick?: () => void
  color?: PFColor
  iconColor?: PFColor
  maxWidth?: number
  disableLinks?: boolean
}

export function TextCell(props: TextCellProps) {
  const navigate = usePageNavigate()
  return (
    <Split style={{ maxWidth: '100%' }}>
      {props.icon && (
        <SplitItem>
          <IconWrapper
            size={props.iconSize ?? 'sm'}
            color={props.iconColor ?? props.color}
            padRight
          >
            {props.icon}
          </IconWrapper>
        </SplitItem>
      )}
      {props.text && (
        <SplitItem style={{ maxWidth: '100%' }}>
          <div
            style={{
              maxWidth: props.maxWidth ?? '100%',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              color: props.color ? getPatternflyColor(props.color) : undefined,
            }}
          >
            {!props.disableLinks && (props.to || props.onClick) ? (
              <a
                href={props.to}
                onClick={(e) => {
                  e.preventDefault()
                  if (props.onClick) {
                    props.onClick()
                  } else {
                    navigate(props.to)
                  }
                }}
              >
                {props.text}
              </a>
            ) : (
              <>{props.text}</>
            )}
          </div>
        </SplitItem>
      )}
    </Split>
  )
}
