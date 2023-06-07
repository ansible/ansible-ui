/* eslint-disable i18next/no-literal-string */
import { Text } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  PageDashboardGettingStarted,
  PageDashboardGettingStartedStep,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';

export function AwxGettingStartedCard(props: {
  hasInventory: boolean;
  hasExecutonEnvironment: boolean;
  hasJobTemplate: boolean;
}) {
  const { t } = useTranslation();
  const { hasInventory, hasExecutonEnvironment, hasJobTemplate } = props;

  const steps = useMemo<PageDashboardGettingStartedStep[]>(
    () => [
      {
        title: t('Inventory'),
        description: t('Create an inventory.'),
        to: RouteObj.Inventories,
        isComplete: hasInventory,
      },
      {
        title: t('Executon Environment'),
        description: t('Create an executon environment.'),
        to: RouteObj.ExecutionEnvironments,
        isComplete: hasExecutonEnvironment,
      },
      {
        title: t('Job Template'),
        description: t('Create a job template.'),
        to: RouteObj.Jobs,
        isComplete: hasJobTemplate,
      },
    ],
    [hasExecutonEnvironment, hasInventory, hasJobTemplate, t]
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
