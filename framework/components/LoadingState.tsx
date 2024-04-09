import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Spinner,
} from '@patternfly/react-core';

export function LoadingState(props: { title?: string }) {
  return (
    <EmptyState variant={EmptyStateVariant.full} isFullHeight>
      <EmptyStateIcon icon={() => <Spinner />} />
      <EmptyStateHeader titleText={props.title} headingLevel="h4" data-cy="empty-state-title" />
    </EmptyState>
  );
}
