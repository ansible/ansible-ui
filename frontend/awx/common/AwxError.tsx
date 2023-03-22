import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { HTTPError } from '../../common/crud/http-error';

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
        {error instanceof HTTPError && error.responseBody && (
          <EmptyStateBody>{JSON.stringify(error.responseBody)}</EmptyStateBody>
        )}
        {handleRefresh && (
          <Button variant="primary" onClick={handleRefresh}>
            {t('Refresh')}
          </Button>
        )}
      </EmptyState>
    </Bullseye>
  );
}
