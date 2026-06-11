import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyStateCustom } from './EmptyStateCustom';

export function EmptyStateFilter(props: {
  button?: string;
  clearAllFilters?: () => void;
  description?: string;
  title?: string;
}) {
  const { t } = useTranslation();
  const { button, clearAllFilters, description, title } = props;

  const defaultButton = t('Clear all filters');
  const defaultDescription = t(
    'No results match the filter criteria. Try changing your filter settings.'
  );
  const defaultTitle = t('No results found');

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
