/* eslint-disable i18next/no-literal-string */
import { Text } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  PageDashboardGettingStarted,
  PageDashboardGettingStartedStep,
} from '../../../../framework';
import { useGetPageUrl } from '../../../../framework/PageNavigation/useGetPageUrl';
import { AwxRoute } from '../../main/AwxRoutes';

export function AwxGettingStartedCard(props: {
  hasInventory: boolean;
  hasExecutionEnvironment: boolean;
  hasJobTemplate: boolean;
}) {
  const { t } = useTranslation();
  const { hasInventory, hasExecutionEnvironment, hasJobTemplate } = props;
  const getPageUrl = useGetPageUrl();
  const steps = useMemo<PageDashboardGettingStartedStep[]>(
    () => [
      {
        title: t('Inventory'),
        description: t('Create an inventory.'),
        to: getPageUrl(AwxRoute.Inventories),
        isComplete: hasInventory,
      },
      {
        title: t('Execution Environment'),
        description: t('Create an execution environment.'),
        to: getPageUrl(AwxRoute.ExecutionEnvironments),
        isComplete: hasExecutionEnvironment,
      },
      {
        title: t('Job Template'),
        description: t('Create a job template.'),
        to: getPageUrl(AwxRoute.Jobs),
        isComplete: hasJobTemplate,
      },
    ],
    [getPageUrl, hasExecutionEnvironment, hasInventory, hasJobTemplate, t]
  );

  return (
    <PageDashboardGettingStarted steps={steps}>
      <Text>
        To learn how to get started, view the{' '}
        <Link to="https://docs.ansible.com" target="_blank">
          documentation
        </Link>
        , or follow the steps below.
      </Text>
    </PageDashboardGettingStarted>
  );
}
