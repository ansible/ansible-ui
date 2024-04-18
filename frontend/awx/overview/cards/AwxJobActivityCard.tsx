import { CardBody, Flex, FlexItem } from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { PageSingleSelect } from '../../../../framework/PageInputs/PageSingleSelect';
import { useGetPageUrl } from '../../../../framework/PageNavigation/useGetPageUrl';
import { AwxRoute } from '../../main/AwxRoutes';
import { DashboardJobPeriod, DashboardJobType, JobsChart } from '../charts/JobsChart';

export function AwxJobActivityCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<DashboardJobPeriod | null>('month');
  const [jobType, setJobType] = useState<DashboardJobType | null>('all');
  const getPageUrl = useGetPageUrl();
  return (
    <PageDashboardCard
      title={t('Job Activity')}
      linkText={t('Go to Jobs')}
      to={getPageUrl(AwxRoute.Jobs)}
      width="xxl"
      height="sm"
      headerControls={
        <Flex spaceItems={{ default: 'spaceItemsNone' }} style={{ gap: 8 }}>
          <FlexItem>
            <PageSingleSelect<DashboardJobPeriod>
              placeholder={t('Select period')}
              value={period}
              onSelect={setPeriod}
              options={[
                { label: t('Past month'), value: 'month' },
                { label: t('Past two weeks'), value: 'two_weeks' },
                { label: t('Past week'), value: 'week' },
                // { label: t('Past 24 hours'), value: 'day' },
              ]}
              isRequired
            />
          </FlexItem>
          <FlexItem>
            <PageSingleSelect<DashboardJobType>
              placeholder={t('Select job types')}
              value={jobType}
              onSelect={setJobType}
              options={[
                { label: t('All job types'), value: 'all' },
                { label: t('Inventory sync'), value: 'inv_sync' },
                { label: t('Scm update'), value: 'scm_update' },
                { label: t('Playbook run'), value: 'playbook_run' },
              ]}
              isRequired
            />
          </FlexItem>
        </Flex>
      }
    >
      <CardBody>
        <JobsChart period={period!} jobType={jobType!} />
      </CardBody>
    </PageDashboardCard>
  );
}
