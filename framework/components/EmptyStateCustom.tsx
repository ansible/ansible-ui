import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
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
    <EmptyState variant={variant || EmptyStateVariant.full} style={style} isFullHeight>
      {icon && <EmptyStateIcon icon={icon} />}
      <EmptyStateHeader titleText={<>{title}</>} headingLevel="h4" data-cy="empty-state-title" />
      <EmptyStateBody data-cy={props.description}>{description}</EmptyStateBody>
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
