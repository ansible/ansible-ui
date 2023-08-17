import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, SyncIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { RequestError } from '../../common/crud/RequestError';

export function AwxError(props: { error: Error; handleRefresh?: () => void }) {
  const { error, handleRefresh } = props;
  const { t } = useTranslation();
  return (
    <Bullseye>
      <EmptyState>
        <EmptyStateIcon icon={ExclamationCircleIcon} />
        <Title headingLevel="h4" size="lg">
          {error.message}
        </Title>
        {error instanceof RequestError && error.body && (
          <EmptyStateBody>{JSON.stringify(error.body)}</EmptyStateBody>
        )}
        {handleRefresh && (
          <Button variant="primary" onClick={handleRefresh} icon={<SyncIcon />}>
            {t('Refresh')}
          </Button>
        )}
      </EmptyState>
    </Bullseye>
  );
}
