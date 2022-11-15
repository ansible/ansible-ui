import { Children, cloneElement, isValidElement, ReactNode } from 'react'
import { getPatternflyColor, PFColor } from './pfcolors'

export function IconWrapper(props: {
  children: ReactNode
  color?: PFColor
  size?: 'sm' | 'md' | 'lg'
  noPadding?: boolean
}) {
  const newProps: {
    color?: string
    size?: string
  } = {}
  if (props.color) {
    newProps.color = getPatternflyColor(props.color)
  }
  let marginOffset: number | undefined = undefined
  let marginRight: number | undefined = undefined
  if (props.size) {
    newProps.size = props.size
    switch (props.size) {
      case 'sm':
        marginRight = 6
        break
      case 'md':
        marginOffset = -2
        marginRight = 6
        break
      case 'lg':
        marginOffset = -6
        marginRight = 6
        break
    }
  }
  if (props.noPadding) {
    marginRight = undefined
  }
  const newChildren = Children.toArray(props.children).map((child) => {
    if (isValidElement(child)) {
      const newChild = cloneElement(child, newProps)
      return newChild
    } else {
      return child
    }
  })
  return (
    <div style={{ marginTop: marginOffset, marginBottom: marginOffset, marginRight }}>
      {newChildren}
    </div>
  )
}
