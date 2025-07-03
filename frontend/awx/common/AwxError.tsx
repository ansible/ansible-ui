import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';
import { ExclamationCircleIcon, SyncIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export function AwxError(props: { error: Error; handleRefresh?: () => void }) {
  const { error, handleRefresh } = props;
  const { t } = useTranslation();
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
        {handleRefresh && (
          <Button variant="primary" onClick={handleRefresh} icon={<SyncIcon />}>
            {t('Refresh')}
          </Button>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
}
