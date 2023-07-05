import { Flex, FlexItem } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { IconWrapper } from '../components/IconWrapper';
import { PFColor, getPatternflyColor } from '../components/pfcolors';
import { usePageNavigate } from '../components/usePageNavigate';

export interface TextCellProps {
  icon?: ReactNode;
  iconSize?: 'sm' | 'md' | 'lg';
  iconAlign?: 'left' | 'right';
  text?: string | null;
  to?: string;
  onClick?: () => void;
  color?: PFColor;
  iconColor?: PFColor;
  maxWidth?: number;
  disableLinks?: boolean;
}
export function TextCell(props: TextCellProps) {
  const navigate = usePageNavigate();
  return (
    <Flex
      spaceItems={{ default: 'spaceItemsNone' }}
      flexWrap={{ default: 'nowrap' }}
      alignItems={{ default: 'alignItemsBaseline' }}
    >
      {props.icon &&
        (props?.iconAlign === undefined || (props.iconAlign && props.iconAlign !== 'right')) && (
          <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
            <IconWrapper
              size={props.iconSize ?? 'sm'}
              color={props.iconColor ?? props.color}
              padRight
            >
              {props.icon}
            </IconWrapper>
          </FlexItem>
        )}
      {props.text && (
        <FlexItem style={{ maxWidth: '100%' }}>
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
                style={{
                  color: props.color ? getPatternflyColor(props.color) : undefined,
                }}
                href={props.to}
                onClick={(e) => {
                  e.preventDefault();
                  if (props.onClick) {
                    props.onClick();
                  } else {
                    navigate(props.to);
                  }
                }}
              >
                {props.text}
              </a>
            ) : (
              <>{props.text}</>
            )}
          </div>
        </FlexItem>
      )}
      {props.icon && props.iconAlign === 'right' && (
        <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
          <IconWrapper
            size={props.iconSize ?? 'sm'}
            padLeft={true}
            color={props.iconColor ?? props.color}
          >
            {props.icon}
          </IconWrapper>
        </FlexItem>
      )}
    </Flex>
  );
}
