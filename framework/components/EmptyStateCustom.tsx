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
}) {
  const { title, description, icon, button } = props;
  return (
    <EmptyState variant={EmptyStateVariant.small}>
      {icon && <EmptyStateIcon icon={icon} />}
      <Title headingLevel="h4" size="lg">
        {title}
      </Title>
      <EmptyStateBody>{description}</EmptyStateBody>
      {button && <EmptyStatePrimary>{button}</EmptyStatePrimary>}
    </EmptyState>
  );
}
