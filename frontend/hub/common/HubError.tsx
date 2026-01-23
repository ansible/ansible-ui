import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';
import { ExclamationCircleIcon, SyncIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export function HubError(props: { error?: Error | undefined; handleRefresh?: () => void }) {
  const { t } = useTranslation();
  const error = props.error || new Error(t('NotFound'));

  return (
    <EmptyState
      headingLevel="h4"
      icon={ExclamationCircleIcon}
      titleText={<>{error?.message}</>}
      isFullHeight
    >
      <EmptyStateFooter>
        {error instanceof RequestError && error.details && (
          <EmptyStateBody>{error.details}</EmptyStateBody>
        )}
        {props.handleRefresh && (
          <Button variant="primary" onClick={props.handleRefresh} icon={<SyncIcon />}>
            {t('Refresh')}
          </Button>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
}
