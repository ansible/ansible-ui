import { CardBody, ProgressStep, ProgressStepper, Stack } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageDashboardCard } from './PageDashboardCard';

export interface PageDashboardGettingStartedStep {
  title: string;
  description: string;
  to: string;
  isComplete: boolean;
}

export function PageDashboardGettingStarted(props: {
  steps: PageDashboardGettingStartedStep[];
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { steps } = props;
  const isComplete = steps.every((step) => step.isComplete);
  if (isComplete) return <></>;

  return (
    <PageDashboardCard title={t('Getting Started')} width="xxl">
      <CardBody>
        <Stack hasGutter>
          <div>{props.children}</div>
          <ProgressStepper>
            {steps.map((step, index) => (
              <ProgressStep
                key={index}
                variant={step.isComplete ? 'success' : 'info'}
                description={step.description}
              >
                <Link to={step.to}>{step.title}</Link>
              </ProgressStep>
            ))}
          </ProgressStepper>
        </Stack>
      </CardBody>
    </PageDashboardCard>
  );
}
