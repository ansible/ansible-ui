import { Children, cloneElement, isValidElement, ReactNode } from 'react';
import { getPatternflyColor, PFColor } from './pfcolors';

export function IconWrapper(props: {
  children: ReactNode;
  color?: PFColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padRight?: boolean;
}) {
  const newProps: {
    color?: string;
    size?: string;
    marginRight?: number;
  } = {};

  if (props.color) {
    newProps.color = getPatternflyColor(props.color);
  }

  if (props.size) {
    newProps.size = props.size;
  }

  let paddingRight = 0;
  if (props.padRight) {
    switch (props.size) {
      case 'sm':
        paddingRight = 4;
        break;
      case 'md':
        paddingRight = 6;
        break;
      case 'lg':
        paddingRight = 8;
        break;
      case 'xl':
        paddingRight = 12;
        break;
    }
  }

  const newChildren = Children.toArray(props.children).map((child) => {
    if (isValidElement(child)) {
      return cloneElement(child, newProps);
    } else {
      return child;
    }
  });

  return <div style={{ paddingRight }}>{newChildren}</div>;
}
