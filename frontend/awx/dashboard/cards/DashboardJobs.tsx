import { CardBody, CardHeader, CardTitle, Flex, FlexItem } from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FormGroupSelectOption } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../Routes';
import { DashboardJobPeriod, DashboardJobType, JobsChart } from '../charts/JobsChart';

export function DashboardJobsCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<DashboardJobPeriod | undefined>('month');
  const [jobType, setJobType] = useState<DashboardJobType | undefined>('all');
  return (
    <PageDashboardCard style={{ minHeight: 300 }}>
      <CardHeader>
        <Flex style={{ width: '100%' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem grow={{ default: 'grow' }}>
            <Link to={RouteObj.Jobs}>
              <CardTitle>{t('Jobs')}</CardTitle>
            </Link>
          </FlexItem>
          <FlexItem>
            <FormGroupSelectOption<DashboardJobPeriod>
              placeholderText={t('Select period')}
              value={period}
              onSelect={(e, v) => {
                e.stopPropagation();
                setPeriod(v as DashboardJobPeriod);
              }}
              options={[
                { label: t('Past month'), value: 'month' },
                { label: t('Past two weeks'), value: 'two_weeks' },
                { label: t('Past week'), value: 'week' },
                // { label: t('Past 24 hours'), value: 'day' },
              ]}
            />
          </FlexItem>
          <FlexItem>
            <FormGroupSelectOption<DashboardJobType>
              placeholderText={t('Select job types')}
              value={jobType}
              onSelect={(e, v) => {
                e.stopPropagation();
                setJobType(v as DashboardJobType);
              }}
              options={[
                { label: t('All job types'), value: 'all' },
                { label: t('Inventory sync'), value: 'inv_sync' },
                { label: t('Scm update'), value: 'scm_update' },
                { label: t('Playbook run'), value: 'playbook_run' },
              ]}
            />
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        <JobsChart period={period} jobType={jobType} />
      </CardBody>
    </PageDashboardCard>
  );
}
