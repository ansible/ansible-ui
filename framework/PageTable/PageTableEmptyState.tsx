import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { ComponentType, ReactNode } from 'react';

export function PageTableEmptyState(props: {
  icon?: ComponentType;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <EmptyState isFullHeight>
      <EmptyStateHeader
        titleText={props.title}
        icon={<EmptyStateIcon icon={props.icon ?? PlusCircleIcon} />}
      />
      {props.description && <EmptyStateBody>{props.description}</EmptyStateBody>}
      {props.children && (
        <EmptyStateFooter>
          <EmptyStateActions>{props.children}</EmptyStateActions>
        </EmptyStateFooter>
      )}
    </EmptyState>
  );
}
