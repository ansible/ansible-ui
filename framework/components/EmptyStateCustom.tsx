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
<<<<<<< HEAD
  footNote?: string;
  image?: ReactElement;
}) {
  const { title, description, icon, button, footNote, image } = props;
  return (
    <EmptyState variant={EmptyStateVariant.full}>
=======
  variant?: ReactNode;
}) {
  const { title, description, icon, button, variant } = props;
  return (
    <EmptyState variant={variant || EmptyStateVariant.small}>
>>>>>>> c58efa8c (add empty state variant back)
      {icon && <EmptyStateIcon icon={icon} />}
      <Title headingLevel="h4" size="lg">
        {title}
      </Title>
      <EmptyStateBody>{description}</EmptyStateBody>
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
