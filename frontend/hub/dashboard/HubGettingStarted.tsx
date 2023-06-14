/* eslint-disable i18next/no-literal-string */
import { Text } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageDashboardGettingStarted, PageDashboardGettingStartedStep } from '../../../framework';
import { RouteObj } from '../../Routes';

export function HubGettingStartedCard(props: {
  hasNamespace: boolean;
  hasCollection: boolean;
  hasExecutionEnvironment: boolean;
}) {
  const { t } = useTranslation();
  const { hasNamespace, hasExecutionEnvironment, hasCollection } = props;

  const steps = useMemo<PageDashboardGettingStartedStep[]>(
    () => [
      {
        title: t('Namespace'),
        description: t('Create an namespace.'),
        to: RouteObj.CreateNamespace,
        isComplete: hasNamespace,
      },
      {
        title: t('Collection'),
        description: t('Create a collection.'),
        to: RouteObj.Collections,
        isComplete: hasCollection,
      },
      {
        title: t('Environment'),
        description: t('Create an environment.'),
        to: RouteObj.HubExecutionEnvironments,
        isComplete: hasExecutionEnvironment,
      },
    ],
    [t, hasNamespace, hasCollection, hasExecutionEnvironment]
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
