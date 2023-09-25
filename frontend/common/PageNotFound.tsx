import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Stack,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function PageNotFound(props: { dashboardUrl?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dashboardUrl } = props;
  return (
    <EmptyState>
      <EmptyStateIcon icon={ExclamationCircleIcon} />
      <Title headingLevel="h2" size="lg">
        {t('Page not found')}
      </Title>
      <EmptyStateBody>{t('We could not find that page.')}</EmptyStateBody>
      <EmptyStateSecondaryActions>
        <Stack hasGutter>
          <Button onClick={() => navigate(-1)}>{t('Return to previous page')}</Button>
          <Button component={(props) => <Link to={dashboardUrl} {...props} />}>
            {t('Return to dashboard')}
          </Button>
        </Stack>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
}
