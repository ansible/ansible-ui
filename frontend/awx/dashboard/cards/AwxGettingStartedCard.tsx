/* eslint-disable i18next/no-literal-string */
import { CardBody, ProgressStep, ProgressStepper, Stack, Text } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../Routes';

export function AwxGettingStartedCard(props: {
  hasInventory: boolean;
  hasExecutonEnvironment: boolean;
  hasJobTemplate: boolean;
}) {
  const { t } = useTranslation();
  const { hasInventory, hasExecutonEnvironment, hasJobTemplate } = props;
  return (
    <>
      {(!hasInventory || !hasExecutonEnvironment || !hasJobTemplate) && (
        <PageDashboardCard title={t('Getting started')} width="xxl">
          <CardBody>
            <Stack hasGutter>
              <Text>
                To learn how to get started, view the{' '}
                <Link to="https://docs.ansible.com" target="_blank">
                  documentation
                </Link>
                , or follow the steps below.
              </Text>
              <ProgressStepper>
                <ProgressStep
                  variant={hasInventory ? 'success' : 'info'}
                  description="Create an inventory."
                >
                  <Link to={RouteObj.Inventories}>Inventory</Link>
                </ProgressStep>
                <ProgressStep
                  variant={hasInventory ? (hasExecutonEnvironment ? 'success' : 'info') : 'pending'}
                  description="Create an executon environment."
                >
                  <Link to={RouteObj.ExecutionEnvironments}>Executon Environment</Link>
                </ProgressStep>
                <ProgressStep
                  variant={
                    hasInventory && hasExecutonEnvironment
                      ? hasJobTemplate
                        ? 'success'
                        : 'info'
                      : 'pending'
                  }
                  description="Create a job template."
                >
                  <Link to={RouteObj.Jobs}>Job Template</Link>
                </ProgressStep>
              </ProgressStepper>
            </Stack>
          </CardBody>
        </PageDashboardCard>
      )}
    </>
  );
}
