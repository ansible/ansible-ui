import React from 'react';
import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { EmptyStateCustom } from './EmptyStateCustom';

export function EmptyStateFilter(props: {
  button?: string;
  clearAllFilters?: () => void;
  description?: string;
  title?: string;
}) {
  const { button, clearAllFilters, description, title } = props;

  const defaultButton = 'Clear all filters';
  const defaultDescription =
    'No results match the filter criteria. Try changing your filter settings.';
  const defaultTitle = 'No results found';

  return (
    <EmptyStateCustom
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={SearchIcon}
      button={
        clearAllFilters ? (
          <Button onClick={clearAllFilters} variant="link">
            {button || defaultButton}
          </Button>
        ) : undefined
      }
    />
  );
}
