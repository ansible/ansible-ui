import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  Title,
  EmptyStateBody,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Button,
} from '@patternfly/react-core';

export function EmptyStateError(props: { message?: string }) {
  const { t } = useTranslation();
  const title = t('Something went wrong');
  const description = t('Please refresh the page by using the button below.');
  const button = t('Refresh');
  const { message } = props;
  return (
    <EmptyState variant={EmptyStateVariant.small} style={{ paddingTop: 48 }}>
      <EmptyStateIcon icon={ExclamationCircleIcon} color="var(--pf-global--danger-color--100)" />
      <Title headingLevel="h2" size="lg">
        {message || title}
      </Title>
      <EmptyStateBody>{description}</EmptyStateBody>
      <Button variant="primary" onClick={() => window.location.reload()}>
        {button}
      </Button>
    </EmptyState>
  );
}
