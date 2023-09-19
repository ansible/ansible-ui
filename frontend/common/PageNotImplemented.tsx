import {
  Button,
  EmptyState,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Page,
  Stack,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function PageNotImplemented() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Page>
      <EmptyState variant={EmptyStateVariant.small} style={{ paddingTop: 48 }}>
        <EmptyStateIcon icon={ExclamationCircleIcon} />
        <Title headingLevel="h2" size="lg">
          {t('This page is not yet available in the tech preview.')}
        </Title>
        <EmptyStateSecondaryActions>
          <Stack hasGutter>
            <Button onClick={() => navigate(-1)}>{t('Return to previous page')}</Button>
            <Button component={(props) => <Link to={'/'} {...props} />}>
              {t('Return to dashboard')}
            </Button>
          </Stack>
        </EmptyStateSecondaryActions>
      </EmptyState>
    </Page>
  );
}
