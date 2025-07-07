import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { ComponentType, CSSProperties, ReactNode } from 'react';

export function PageTableEmptyState(props: {
  icon?: ComponentType;
  title: string;
  description?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <EmptyState icon={props.icon ?? PlusCircleIcon} titleText={props.title} isFullHeight>
      {props.description && (
        <EmptyStateBody style={{ ...props.style }}>{props.description}</EmptyStateBody>
      )}
      {props.children && (
        <EmptyStateFooter>
          <EmptyStateActions>{props.children}</EmptyStateActions>
        </EmptyStateFooter>
      )}
    </EmptyState>
  );
}
