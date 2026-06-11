import { Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { ReactElement, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconWrapper } from '../components/IconWrapper';
import { PFColor } from '../components/pfcolors';

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
  tooltip?: ReactElement;
  tooltipId?: number;
}
export function TextCell(props: Readonly<TextCellProps>) {
  const navigate = useNavigate();
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
        <Tooltip
          trigger={props.tooltip ? undefined : 'manual'}
          content={props.tooltip}
          key={props.tooltipId}
        >
          <FlexItem
            style={{ maxWidth: '100%' }}
            data-cy={String(props.text).toLocaleLowerCase() + '-status'}
            data-testid={String(props.text).toLocaleLowerCase() + '-status'}
          >
            <div
              style={{
                maxWidth: props.maxWidth ?? '100%',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {!props.disableLinks && (props.to || props.onClick) ? (
                <a
                  href={props.to}
                  onClick={(e) => {
                    e.preventDefault();
                    if (props.onClick) {
                      props.onClick();
                    } else {
                      if (!props.to) return;
                      void navigate(props.to);
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
        </Tooltip>
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
