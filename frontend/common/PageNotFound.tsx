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
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../Routes';

export function PageNotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Page>
      <EmptyState variant={EmptyStateVariant.small} style={{ paddingTop: 48 }}>
        <EmptyStateIcon icon={ExclamationCircleIcon} />
        <Title headingLevel="h2" size="lg">
          {t('We could not find that page')}
        </Title>
        {/* <EmptyStateBody>{error.message}</EmptyStateBody> */}
        <EmptyStateSecondaryActions>
          <Stack hasGutter>
            <Button onClick={() => navigate(-1)}>{t('Return to previous page')}</Button>
            <Button onClick={() => navigate(RouteObj.AutomationServers)}>
              {t('Return to home page')}
            </Button>
          </Stack>
        </EmptyStateSecondaryActions>
      </EmptyState>
    </Page>
  );
}
