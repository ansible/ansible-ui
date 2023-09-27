import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import React, { ComponentClass, ReactElement, ReactNode } from 'react';

export function EmptyStateCustom(props: {
  title: string;
  description: ReactNode;
  icon?: ComponentClass;
  button?: ReactElement;
  footNote?: string;
  image?: ReactElement;
  variant?: 'xs' | 'xl' | 'small' | 'large' | 'full' | undefined;
  style?: React.CSSProperties;
}) {
  const { title, description, icon, button, footNote, image, variant, style } = props;
  return (
    <EmptyState variant={variant || EmptyStateVariant.full} style={style} isFullHeight>
      {icon && <EmptyStateIcon icon={icon} />}
      <Title data-cy={props.title} headingLevel="h4" size="lg">
        {title}
      </Title>
      <EmptyStateBody data-cy={props.description}>{description}</EmptyStateBody>
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
