import React, { ComponentClass, ReactElement, ReactNode } from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';

export function EmptyStateCustom(props: {
  title: string;
  description: ReactNode;
  icon?: ComponentClass;
  button?: ReactElement;
  actions?: ReactNode;
  footNote?: string;
  image?: ReactElement;
  variant?: 'xs' | 'xl' | 'small' | 'large' | 'full' | undefined;
  style?: React.CSSProperties;
}) {
  const { title, description, icon, button, footNote, image, variant, style, actions } = props;
  return (
    <EmptyState variant={variant || EmptyStateVariant.full} style={style}>
      {icon && <EmptyStateIcon icon={icon} />}
      <Title headingLevel="h4" size="lg">
        {title}
      </Title>
      <EmptyStateBody>{description}</EmptyStateBody>
      {actions && actions}
      {button && <EmptyStatePrimary>{button}</EmptyStatePrimary>}
      {image && (
        <>
          {' '}
          <br /> <EmptyStateBody>{image}</EmptyStateBody>
        </>
      )}
      {footNote && <EmptyStateBody>{footNote}</EmptyStateBody>}
    </EmptyState>
  );
}
