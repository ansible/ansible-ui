import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  PageSection,
  Stack,
  Title,
} from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function UnderDevelopment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PageSection isWidthLimited>
      <EmptyState variant={EmptyStateVariant.small} style={{ paddingTop: 48 }}>
        <EmptyStateIcon icon={WrenchIcon} />
        <Title headingLevel="h2" size="lg">
          {t('Under Development')}
        </Title>
        <EmptyStateBody>{t('This page is under development.')}</EmptyStateBody>
        <EmptyStateSecondaryActions>
          <Stack hasGutter>
            <Button onClick={() => navigate(-1)}>{t('Return to previous page')}</Button>
            <Button component={(props) => <Link to={'/'} {...props} />}>
              {t('Return to dashboard')}
            </Button>
          </Stack>
        </EmptyStateSecondaryActions>
      </EmptyState>
    </PageSection>
  );
}
