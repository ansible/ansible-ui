/* eslint-disable i18next/no-literal-string */
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../framework';
import { PageDashboard } from '../../../framework/PageDashboard/PageDashboard';
import { ActivationsCard } from './ActivationsCard';
import { ProjectsCard } from './ProjectsCard';
import RuleAuditChart from './RuleAuditChartCard';

export default function EdaDashboard() {
  const { t } = useTranslation();
  return (
    <Fragment>
      <PageHeader
        title={t('Welcome to EDA Server')}
        description={t(
          'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
        )}
      />
      <PageDashboard>
        <RuleAuditChart />
        <ProjectsCard />
        <ActivationsCard />
      </PageDashboard>
    </Fragment>
  );
}
