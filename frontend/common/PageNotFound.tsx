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
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function PageNotFound(props: { dashboardUrl?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dashboardUrl } = props;
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
            <Button component={(props) => <Link to={dashboardUrl} {...props} />}>
              {t('Return to dashboard')}
            </Button>
          </Stack>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
