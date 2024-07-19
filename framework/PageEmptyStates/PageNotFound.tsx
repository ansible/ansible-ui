import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Stack,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function PageNotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <EmptyState isFullHeight>
      <EmptyStateHeader
        titleText={<>{t('Page not found')}</>}
        icon={<EmptyStateIcon icon={ExclamationCircleIcon} />}
        headingLevel="h2"
      />
      <EmptyStateBody>{t('We could not find that page.')}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Stack hasGutter>
            <Button onClick={() => navigate(-1)}>{t('Return to previous page')}</Button>
            <Button component={(props) => <Link to="/" {...props} />}>
              {t('Return to dashboard')}
            </Button>
          </Stack>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
