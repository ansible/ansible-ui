import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Stack,
} from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

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
      <EmptyStateFooter>
        <EmptyStateActions>
          <Stack hasGutter>
            <Button onClick={() => void navigate(-1)}>{t('Return to previous page')}</Button>
            <Button component={(props) => <Link to={'/'} {...props} />}>
              {t('Return to dashboard')}
            </Button>
          </Stack>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
