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

export function EmptyStateError(props: { titleProp?: string; message?: string }) {
  const { t } = useTranslation();
  const title = t('Something went wrong');
  const description = t('Please refresh the page by using the button below.');
  const button = t('Refresh');
  const { titleProp, message } = props;
  return (
    <EmptyState variant={EmptyStateVariant.small} style={{ paddingTop: 48 }}>
      <EmptyStateIcon icon={ExclamationCircleIcon} color="var(--pf-global--danger-color--100)" />
      <Title headingLevel="h2" size="lg">
        {titleProp || title}
      </Title>
      <EmptyStateBody>{message}</EmptyStateBody>
      <EmptyStateBody>{description}</EmptyStateBody>
      <Button variant="primary" onClick={() => window.location.reload()}>
        {button}
      </Button>
    </EmptyState>
  );
}
