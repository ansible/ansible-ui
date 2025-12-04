import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import React, { ComponentClass, ReactElement, ReactNode } from 'react';

export function EmptyStateCustom(props: {
  title: string;
  description: ReactNode;
  icon?: ComponentClass;
  button?: ReactElement;
  footNote?: string;
  image?: ReactElement;
  variant?: 'xs' | 'sm' | 'lg' | 'xl' | 'full' | undefined;
  style?: React.CSSProperties;
}) {
  const { title, description, icon, button, footNote, image, variant, style } = props;
  return (
    <EmptyState
      icon={icon}
      headingLevel="h4"
      titleText={<>{title}</>}
      variant={variant || EmptyStateVariant.full}
      style={style}
      isFullHeight
    >
      <EmptyStateBody data-cy={props.description} data-testid={props.description}>
        {description}
      </EmptyStateBody>
      <EmptyStateFooter>
        {button && <EmptyStateActions>{button}</EmptyStateActions>}
        {image && (
          <>
            {' '}
            <br /> <EmptyStateBody>{image}</EmptyStateBody>
          </>
        )}
        {footNote && <EmptyStateBody>{footNote}</EmptyStateBody>}
      </EmptyStateFooter>
    </EmptyState>
  );
}
