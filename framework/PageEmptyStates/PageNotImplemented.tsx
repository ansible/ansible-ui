import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Stack,
  EmptyStateActions,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function PageNotImplemented() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <EmptyState isFullHeight>
      <EmptyStateHeader
        titleText={<>{t('Under Development')}</>}
        icon={<EmptyStateIcon icon={WrenchIcon} />}
        headingLevel="h2"
      />
      <EmptyStateBody>{t('This page is not yet available in the tech preview.')}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Stack hasGutter>
            <Button onClick={() => navigate(-1)}>{t('Return to previous page')}</Button>
            <Button component={(props) => <Link to={'/'} {...props} />}>
              {t('Return to dashboard')}
            </Button>
          </Stack>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
