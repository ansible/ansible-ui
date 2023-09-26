import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Stack,
  Title,
} from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function PageNotImplemented() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <EmptyState isFullHeight>
      <EmptyStateIcon icon={WrenchIcon} />
      <Title headingLevel="h2" size="lg">
        {t('Under Development')}
      </Title>
      <EmptyStateBody>{t('This page is not yet available in the tech preview.')}</EmptyStateBody>
      <EmptyStateSecondaryActions>
        <Stack hasGutter>
          <Button onClick={() => navigate(-1)}>{t('Return to previous page')}</Button>
          <Button component={(props) => <Link to={'/'} {...props} />}>
            {t('Return to dashboard')}
          </Button>
        </Stack>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
}
