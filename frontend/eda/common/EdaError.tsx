import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, SyncIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { RequestError } from '../../common/crud/RequestError';

export function EdaError(props: { error: Error; handleRefresh?: () => void }) {
  const { error, handleRefresh } = props;
  const { t } = useTranslation();
  return (
    <EmptyState isFullHeight>
      <EmptyStateHeader
        titleText={<>{error?.message}</>}
        icon={<EmptyStateIcon icon={ExclamationCircleIcon} />}
        headingLevel="h4"
      />
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
