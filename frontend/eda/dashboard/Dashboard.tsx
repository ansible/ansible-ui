/* eslint-disable i18next/no-literal-string */
import { Grid, GridItem, PageSection, Stack, StackItem } from '@patternfly/react-core';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../framework';
import { ProjectsCard } from './ProjectsCard';
import { ActivationsCard } from './ActivationsCard';
import RuleAuditChartCard from './RuleAuditChartCard';

export default function Dashboard() {
  const { t } = useTranslation();
  return (
    <Fragment>
      <PageHeader
        title={t('Welcome to EDA Server')}
        description={t(
          'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
        )}
      />
      <PageSection>
        <Stack hasGutter>
          <StackItem>
            <RuleAuditChartCard />
          </StackItem>
          <StackItem>
            <Grid hasGutter>
              <GridItem span={6}>
                <ProjectsCard />
              </GridItem>
              <GridItem span={6}>
                <ActivationsCard />
              </GridItem>
            </Grid>
          </StackItem>
        </Stack>
      </PageSection>
    </Fragment>
  );
}
