import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  Stack,
} from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function PageNotImplemented() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <EmptyState
      headingLevel="h2"
      icon={WrenchIcon}
      titleText={<>{t('Under Development')}</>}
      isFullHeight
    >
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
