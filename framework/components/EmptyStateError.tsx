import { Button, EmptyState, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export function EmptyStateError(props: { titleProp?: string; message?: string }) {
  const { t } = useTranslation();
  const title = t('Something went wrong');
  const description = t('Please refresh the page by using the button below.');
  const button = t('Refresh');
  const { titleProp, message } = props;
  return (
    <EmptyState
      headingLevel="h2"
      icon={ExclamationCircleIcon}
      titleText={<>{titleProp || title}</>}
      isFullHeight
    >
      <EmptyStateBody>{message}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateBody>{description}</EmptyStateBody>
        <Button variant="primary" onClick={() => window.location.reload()}>
          {button}
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
}
